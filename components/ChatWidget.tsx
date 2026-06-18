"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Paperclip } from "lucide-react";

const WEBHOOK_URL = "/api/chat";

// WhatsApp fallback shown when the bot needs more info or can't fully answer.
const WHATSAPP_URL =
  "https://wa.me/994552440646?text=" +
  encodeURIComponent(
    "Salam, VIP Motors Baku — avtomobilim üçün yağ seçimi ilə bağlı sualım var."
  );

type Message = {
  role: "bot" | "user";
  text: string;
  image?: string | null;
  contact?: boolean;
};

export function useChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Salam, xoş gəldiniz! VIP Motors Baku sizi salamlayır 👋\nMən sizə avtomobiliniz üçün ən uyğun yağı seçməkdə kömək edəcəm.\n\nZəhmət olmasa yazın:\n• Marka və model\n• İl\n• Mühərrik həcmi (məs. 2.0 mator və ya 2000cc)\n• Yanacaq növü (benzin / dizel / hibrid / elektrik)\n\nNümunə:\n— BMW 320i 2019 2.0 mator benzin\n— BMW 520d 2016 2.0 dizel\n— BMW X5 2020 3.0 mator benzin\n— BMW 530e 2021 hibrid",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const send = async () => {
    const text = input.trim();
    if ((!text && !image) || loading) return;
    setMessages((prev) => [...prev, { role: "user", text, image }]);
    const payload = image ? { message: text, image } : { message: text };
    setInput("");
    setImage(null);
    setLoading(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.reply || "Xəta baş verdi.",
          contact: Boolean(data.needsContact) || !data.reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Bağlantı xətası. Yenidən cəhd edin.", contact: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    open,
    setOpen,
    messages,
    input,
    setInput,
    loading,
    send,
    image,
    setImage,
  };
}

export default function ChatWidget() {
  const {
    open,
    setOpen,
    messages,
    input,
    setInput,
    loading,
    send,
    image,
    setImage,
  } = useChatWidget();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = typeof result === "string" ? result.split(",")[1] : "";
      setImage(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    send();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass-strong w-[min(92vw,380px)] h-[min(70vh,560px)] rounded-[1.25rem] overflow-hidden flex flex-col shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-gradient-to-r from-brand-600/20 via-transparent to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="relative grid h-9 w-9 place-items-center rounded-full bg-brand-500/15 ring-1 ring-brand-500/30">
                  <Sparkles className="h-4 w-4 text-brand-400" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-ink-100">VIP Motors Baku Köməkçi</span>
                  <span className="text-[11px] text-ink-300 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Onlayn
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Bağla"
                className="grid h-8 w-8 place-items-center rounded-full text-ink-300 hover:text-ink-100 hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={scrollRef}
              data-lenis-prevent
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-3 hide-scrollbar"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[80%] rounded-2xl rounded-br-sm px-3.5 py-2 text-sm leading-relaxed bg-brand-500 text-white shadow-[0_8px_24px_-10px_rgba(239,42,58,0.6)] whitespace-pre-line"
                        : "max-w-[80%] rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm leading-relaxed bg-white/[0.04] border border-white/5 text-ink-100 whitespace-pre-line"
                    }
                  >
                    {m.image && (
                      <img
                        src={`data:image/*;base64,${m.image}`}
                        alt="attachment"
                        className="mb-2 rounded-lg max-h-48 w-auto"
                      />
                    )}
                    {m.text}
                    {m.role === "bot" && m.contact && (
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2.5 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Sualınız var? WhatsApp-da davam edin
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 bg-white/[0.04] border border-white/5">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-ink-300 animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-white/5 bg-ink-900/60 p-3 flex flex-col gap-2">
              {image && (
                <div className="relative inline-block w-fit">
                  <img
                    src={`data:image/*;base64,${image}`}
                    alt="preview"
                    className="h-16 w-16 object-cover rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    aria-label="Şəkli sil"
                    className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink-900 border border-white/10 text-ink-200 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  aria-label="Şəkil əlavə et"
                  className="grid h-10 w-10 place-items-center rounded-full text-ink-300 hover:text-ink-100 hover:bg-white/5 disabled:opacity-40 transition-colors"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  disabled={loading}
                  className="flex-1 bg-white/[0.04] border border-white/5 focus:border-brand-500/50 focus:bg-white/[0.06] text-ink-100 placeholder:text-ink-400 text-sm rounded-full px-4 py-2.5 outline-none transition-colors disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading || (!input.trim() && !image)}
                  aria-label="Göndər"
                  className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-[0_8px_24px_-10px_rgba(239,42,58,0.6)]"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Söhbəti bağla" : "Söhbəti aç"}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-brand-500 text-white shadow-[0_10px_40px_-10px_rgba(239,42,58,0.6)] hover:scale-105 active:scale-95 transition-transform"
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-brand-500/40 animate-[pulseRing_2.4s_ease-out_infinite]" />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative"
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="msg"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="relative"
            >
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
