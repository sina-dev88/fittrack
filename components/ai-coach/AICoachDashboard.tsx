"use client";

import {
  Bot,
  Dumbbell,
  Loader2,
  Send,
  Sparkles,
  Trophy,
  Utensils,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  {
    icon: Dumbbell,
    text: "Analyze my training",
  },
  {
    icon: Trophy,
    text: "How am I progressing?",
  },
  {
    icon: Utensils,
    text: "Help with my nutrition",
  },
  {
    icon: Sparkles,
    text: "What should I focus on next?",
  },
];

function createMessage(
  role: Message["role"],
  content: string,
): Message {
  return {
    id: `${Date.now()}-${Math.random()}`,
    role,
    content,
  };
}

export default function AICoachDashboard() {
  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null,
    );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  function resizeTextarea() {
    const textarea =
      textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      160,
    )}px`;
  }

  function handleInputChange(
    value: string,
  ) {
    setInput(value);

    requestAnimationFrame(
      resizeTextarea,
    );
  }

  async function sendMessage(
    messageText?: string,
  ) {
    const text = (
      messageText ?? input
    ).trim();

    if (!text || loading) {
      return;
    }

    setError("");

    const userMessage =
      createMessage(
        "user",
        text,
      );

    const assistantMessage =
      createMessage(
        "assistant",
        "",
      );

    const nextMessages = [
      ...messages,
      userMessage,
    ];

    setMessages([
      ...nextMessages,
      assistantMessage,
    ]);

    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height =
        "auto";
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/ai-coach",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            messages: nextMessages,
          }),
        },
      );

      if (!response.ok) {
        const result =
          await response.json().catch(
            () => null,
          );

        throw new Error(
          result?.error ??
            "Failed to get AI response.",
        );
      }

      if (!response.body) {
        throw new Error(
          "AI response stream is unavailable.",
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      let assistantText = "";

      while (true) {
        const {
          done,
          value,
        } = await reader.read();

        if (done) {
          break;
        }

        assistantText +=
          decoder.decode(value, {
            stream: true,
          });

        setMessages(
          (current) =>
            current.map(
              (message) =>
                message.id ===
                assistantMessage.id
                  ? {
                      ...message,
                      content:
                        assistantText,
                    }
                  : message,
            ),
        );
      }

      assistantText +=
        decoder.decode();

      setMessages(
        (current) =>
          current.map(
            (message) =>
              message.id ===
              assistantMessage.id
                ? {
                    ...message,
                    content:
                      assistantText,
                  }
                : message,
          ),
      );
    } catch (error) {
      console.error(error);

      setMessages(
        (current) =>
          current.filter(
            (message) =>
              message.id !==
              assistantMessage.id,
          ),
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    void sendMessage();
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void sendMessage();
    }
  }

  function clearConversation() {
    if (loading) return;

    setMessages([]);
    setError("");
  }

  const hasMessages =
    messages.length > 0;

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col">
      {/* Header */}
      <section className="mb-6 overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="relative p-6 sm:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Bot className="h-7 w-7" />
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  FitTrack Intelligence
                </div>

                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  AI Coach
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Your personal FitTrack
                  assistant for training,
                  nutrition, recovery,
                  habits and progress.
                </p>
              </div>
            </div>

            {hasMessages && (
              <button
                type="button"
                onClick={
                  clearConversation
                }
                disabled={loading}
                className="rounded-xl border p-2 text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear conversation"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Chat */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border bg-card shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!hasMessages ? (
            <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-4xl">
                🧠
              </div>

              <h2 className="mt-6 text-xl font-semibold">
                How can I help you?
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Ask me about your workouts,
                progress, nutrition,
                recovery, habits or
                anything inside FitTrack.
              </p>

              <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {suggestions.map(
                  (suggestion) => {
                    const Icon =
                      suggestion.icon;

                    return (
                      <button
                        key={
                          suggestion.text
                        }
                        type="button"
                        onClick={() =>
                          void sendMessage(
                            suggestion.text,
                          )
                        }
                        className="flex items-center gap-3 rounded-2xl border p-4 text-left transition hover:bg-muted"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                          <Icon className="h-5 w-5" />
                        </div>

                        <span className="text-sm font-medium">
                          {suggestion.text}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-6">
              {messages.map(
                (message) => {
                  const isUser =
                    message.role ===
                    "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {!isUser && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.content ? (
                          <div className="whitespace-pre-wrap">
                            {
                              message.content
                            }
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>
                              Thinking...
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                },
              )}

              <div
                ref={
                  messagesEndRef
                }
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 sm:mx-6">
            {error}
          </div>
        )}

        {/* Composer */}
        <div className="border-t p-4 sm:p-6">
          <form
            onSubmit={
              handleSubmit
            }
            className="mx-auto max-w-4xl"
          >
            <div className="flex items-end gap-2 rounded-2xl border bg-muted/30 p-2 focus-within:border-foreground">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(event) =>
                  handleInputChange(
                    event.target.value,
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                rows={1}
                maxLength={4000}
                disabled={loading}
                placeholder="Ask your AI Coach..."
                className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  !input.trim()
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              FitTrack AI Coach provides
              general fitness guidance and
              is not a medical professional.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
