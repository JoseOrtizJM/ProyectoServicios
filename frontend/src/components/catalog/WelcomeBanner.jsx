import { useEffect, useState } from "react";

const FADE_DELAY_MS = 3500;
const REMOVE_DELAY_MS = 4000;

export default function WelcomeBanner() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), FADE_DELAY_MS);
    const removeTimer = setTimeout(() => setVisible(false), REMOVE_DELAY_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`rounded-2xl border border-border bg-surface px-6 py-5 text-center transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <h1 className="text-xl font-semibold text-foreground">Bienvenido a Tienda Tech</h1>
      <p className="mt-1 text-sm text-muted">Mouses, teclados, monitores y más — encuentra lo que buscas.</p>
    </div>
  );
}
