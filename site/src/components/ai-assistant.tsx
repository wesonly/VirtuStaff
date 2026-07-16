import { useState, useRef, useEffect } from "react";

const defaultMessages = [
  {
    from: "assistant",
    text: "👋 Hi! I'm your AI setup assistant. How can I help you get started?",
  },
  {
    from: "assistant",
    text: "You can ask me about:\n• Connecting your phone number\n• Setting up your CRM\n• Training your AI employees\n• Importing contacts",
  },
];

const quickReplies = [
  "What CRM are you using?",
  "Would you like help connecting HubSpot?",
  "Let's import your contacts.",
  "Show me how to train my AI",
];

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");

    // Simulate AI response after a short delay
    setTimeout(() => {
      const responses = [
        "Great question! Let me help you with that. What's your current setup like?",
        "I can help with that! First, head to the Getting Started page to see your progress.",
        "No problem at all — I'm here to guide you through every step. Which part are you stuck on?",
        "Good choice! Would you like me to walk you through this step by step?",
      ];
      const reply =
        responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { from: "assistant", text: reply }]);
    }, 800);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl transition-all hover:scale-110 hover:shadow-2xl active:scale-95"
          title="AI Setup Assistant"
        >
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
            />
          </svg>
          {/* Pulse animation ring */}
          <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/30" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex w-80 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-4 dark:border-gray-700 dark:bg-gray-900 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
                AI
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Setup Assistant
                </p>
                <p className="text-[11px] text-white/70">Online · Always here</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-white/70 hover:bg-white/20 hover:text-white"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    msg.from === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                      : "bg-white text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-2 border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-950">
              {quickReplies.map((qr) => (
                <button
                  key={qr}
                  onClick={() => {
                    setMessages((prev) => [
                      ...prev,
                      { from: "user", text: qr },
                    ]);
                    setTimeout(() => {
                      setMessages((prev) => [
                        ...prev,
                        {
                          from: "assistant",
                          text: "Let me guide you through that! Head over to the Getting Started page and I'll walk you through each step.",
                        },
                      ]);
                    }, 600);
                  }}
                  className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-800 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-indigo-950"
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
            <button
              onClick={handleSend}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white transition-all hover:from-indigo-500 hover:to-violet-500 active:scale-95"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
