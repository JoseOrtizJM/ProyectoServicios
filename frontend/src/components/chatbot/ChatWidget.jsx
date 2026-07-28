import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { sendChatMessage } from "../../api/chatbot";
import { extractErrorMessages } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";

// Claude suele responder con **negritas** en markdown — esto las convierte
// a <strong> sin necesitar una librería completa de markdown.
function renderChatContent(content) {
  return content.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export default function ChatWidget() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  if (!isAuthenticated) return null;

  async function handleSend(event) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const previousMessages = messages;
    setError("");
    setInput("");
    setMessages([...previousMessages, { role: "user", content: trimmed }]);
    setSending(true);

    try {
      const data = await sendChatMessage(trimmed, previousMessages);
      setMessages(data.history);
    } catch (err) {
      setError(extractErrorMessages(err)[0]);
      setMessages(previousMessages);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-lg sm:w-96">
          <div className="flex items-center justify-between border-b border-border bg-surface-muted px-4 py-3">
            <span className="text-sm font-semibold text-foreground">Asistente Tienda Tech</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted transition-colors hover:text-foreground"
              aria-label="Cerrar chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted">
                Pregúntame sobre el catálogo: producto más vendido, mejor valorado, más barato…
              </p>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "self-end bg-primary text-primary-foreground"
                    : "self-start bg-surface-muted text-foreground"
                }`}
              >
                {renderChatContent(message.content)}
              </div>
            ))}
            {sending && (
              <div className="self-start rounded-2xl bg-surface-muted px-3 py-2 text-sm text-muted">Escribiendo…</div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && <p className="px-3 pb-1 text-xs text-danger">{error}</p>}

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe tu pregunta…"
              className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
              aria-label="Enviar"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}
