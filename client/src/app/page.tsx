"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/config";
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  Clock,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

type SearchResponse = {
  answer: string;
  sources: string[];
};

type CurrentChatTurn =
  | {
      role: "user";
      content: string;
    }
  | {
      role: "assistant";
      content: string;
      sources: string[];
      time: number; // in ms
      error?: string;
    };

export default function Home() {
  const [queries, setQueries] = useState("");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<CurrentChatTurn[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scroll({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat]);

  async function runSearch(prompt: string) {
    setLoading(true);
    setChat((old) => [...old, { role: "user", content: prompt }]);
    const oldTime = performance.now();
    try {
      const res = await fetch(`${API_URL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: prompt }),
      });
      const json = await res.json();
      const timeDiff = Math.round(performance.now() - oldTime);

      if (!res.ok) {
        setChat((old) => [
          ...old,
          {
            role: "assistant",
            content: "Oops, something went wrong. Please try again later.",
            sources: [],
            time: timeDiff,
            error: "Request failed",
          },
        ]);
      } else {
        const data = json as SearchResponse;
        setChat((old) => [
          ...old,
          {
            role: "assistant",
            content: data.answer,
            sources: data.sources,
            time: timeDiff,
          },
        ]);
      }
    } catch {
      const timeDiff = Math.round(performance.now() - oldTime);
      setChat((old) => [
        ...old,
        {
          role: "assistant",
          content: "Oops, something went wrong. Please try again later.",
          sources: [],
          time: timeDiff,
          error: "Request failed",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleChatSubmit(e: FormEvent) {
    e.preventDefault();
    const prompt = queries.trim();
    if (!prompt || loading) return;
    setQueries("");
    await runSearch(prompt);
  }

  const formatTime = (ms: number) => (ms / 1000).toFixed(1) + "s";

  return (
    <div className="flex h-dvh flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-linear-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-semibold text-slate-800">
              Search Agent
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500">
              AI‑powered answers with sources
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden xs:inline">ready</span>
        </div>
      </header>

      {/* Main chat area  */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 scroll-smooth"
      >
        <div className="mx-auto w-full max-w-2xl space-y-4 sm:space-y-6">
          {chat.length === 0 && (
            <div className="text-center py-8 sm:py-12 px-3 sm:px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 sm:mb-5 shadow-sm">
                <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="text-lg sm:text-xl font-medium text-slate-800 mb-2">
                Ask me anything
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 max-w-md mx-auto">
                Try one of these examples or type your own question.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Best AI tool for editing in 2026?",
                  "Top 3 richest people in 2026",
                  "CI/CD pipeline with GitHub Actions",
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setQueries(example)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs bg-white border border-slate-200 rounded-full text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 shadow-sm"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chat.map((turn, idx) => {
            if (turn.role === "user") {
              return (
                <div
                  key={idx}
                  className="flex justify-end animate-in slide-in-from-right-2 fade-in duration-300"
                >
                  <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 sm:px-5 py-2.5 sm:py-3 max-w-[85%] sm:max-w-[75%] shadow-md">
                    <p className="text-xs sm:text-sm whitespace-pre-wrap wrap-break-words leading-relaxed">
                      {turn.content}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className="flex items-start gap-2 sm:gap-3 animate-in slide-in-from-left-2 fade-in duration-300"
              >
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-700 flex items-center justify-center text-white shadow-md shrink-0">
                  <Bot className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 sm:px-5 py-3 sm:py-4 text-slate-800 shadow-sm border border-slate-200/80 max-w-[90%] sm:max-w-[85%]">
                    <p className="text-xs sm:text-sm whitespace-pre-wrap wrap-break-words leading-relaxed">
                      {turn.content}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-400 px-1">
                    {turn.time && (
                      <span className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 px-2 py-1 rounded-full">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
                        <p>Thought for </p>
                        {formatTime(turn.time)}
                      </span>
                    )}
                    {turn.error && (
                      <span className="flex items-center gap-1 sm:gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                        {turn.error}
                      </span>
                    )}
                  </div>

                  {turn.sources && turn.sources.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm w-full max-w-[90%] sm:max-w-[85%]">
                      <p className="text-[10px] sm:text-xs font-medium text-slate-500 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-1.5">
                        <LinkIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        Sources
                      </p>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {turn.sources.map((src, i) => (
                          <li key={i} className="truncate">
                            <Link
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] sm:text-xs text-indigo-600 hover:text-indigo-800 hover:underline underline-offset-2 transition-colors break-all"
                            >
                              {src}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-2 sm:gap-3 animate-in fade-in duration-300">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600">
                <Loader2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] animate-spin" />
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-slate-600 text-xs sm:text-sm border border-slate-200 shadow-sm">
                Thinking...
              </div>
            </div>
          )}
        </div>
        {/* Spacer for scroll */}
        <div className="h-4" />
      </main>

      {/* Footer input  */}
      <footer className="sticky bottom-0 border-t border-slate-200/70 bg-white/80 backdrop-blur-md px-3 sm:px-4 py-3 sm:py-4">
        <form
          onSubmit={handleChatSubmit}
          className="mx-auto flex w-full max-w-2xl items-center gap-2"
        >
          <Input
            placeholder="Ask your question..."
            value={queries}
            onChange={(e) => setQueries(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-xl border-slate-200 bg-white/90 focus-visible:ring-2 focus-visible:ring-indigo-400/30 text-xs sm:text-sm shadow-sm h-10 sm:h-11"
          />
          <Button
            type="submit"
            disabled={loading || queries.trim().length < 3}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 shadow-md disabled:opacity-50 transition-all duration-200 h-10 sm:h-11"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </footer>
    </div>
  );
}
