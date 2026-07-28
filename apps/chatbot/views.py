import anthropic
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .tools import CHATBOT_TOOLS

SYSTEM_PROMPT = (
    "Eres el asistente de la tienda en línea. Respondes preguntas sobre el "
    "catálogo de productos, ventas y reseñas usando SIEMPRE las herramientas "
    "disponibles antes de responder — nunca inventes precios, nombres de "
    "productos, ventas ni calificaciones. Si una herramienta no encuentra "
    "resultados, dilo con claridad en vez de suponer datos. Responde en "
    "español, de forma breve y directa. Todos los precios están en pesos "
    "mexicanos (MXN)."
)

# El historial se guarda solo como texto plano (no los bloques crudos del
# SDK, que incluyen 'thinking' y no son serializables a JSON sin más) — es
# suficiente para que el modelo mantenga contexto entre preguntas, y evita
# tener que lidiar con el reenvío de bloques de razonamiento entre turnos.


def _valid_history(history):
    if not isinstance(history, list):
        return False
    for item in history:
        if not isinstance(item, dict):
            return False
        if item.get("role") not in ("user", "assistant"):
            return False
        if not isinstance(item.get("content"), str):
            return False
    return True


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    message = (request.data.get("message") or "").strip()
    if not message:
        return Response({"message": ["Escribe una pregunta para el chatbot."]}, status=status.HTTP_400_BAD_REQUEST)

    history = request.data.get("history") or []
    if not _valid_history(history):
        return Response(
            {"history": ["Debe ser una lista de {role: 'user'|'assistant', content: str}."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not settings.ANTHROPIC_API_KEY:
        return Response(
            {"detail": "El chatbot no está configurado en este servidor (falta ANTHROPIC_API_KEY)."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    messages = [{"role": h["role"], "content": h["content"]} for h in history]
    messages.append({"role": "user", "content": message})

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    try:
        # Claude Haiku 4.5: no soporta 'effort' ni thinking adaptativo (son
        # de los modelos 4.6+), así que no se mandan esos parámetros aquí.
        runner = client.beta.messages.tool_runner(
            model="claude-haiku-4-5",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            tools=CHATBOT_TOOLS,
            messages=messages,
        )
        final_message = None
        for msg in runner:
            final_message = msg
    except anthropic.APIError as exc:
        return Response(
            {"detail": f"Error al contactar el chatbot: {exc}"},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    reply_text = "".join(block.text for block in final_message.content if block.type == "text").strip()

    updated_history = messages + [{"role": "assistant", "content": reply_text}]
    return Response({"reply": reply_text, "history": updated_history})
