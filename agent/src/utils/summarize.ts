import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getChatModel } from "../shared/model";
import { SummarizeInputSchema, SummarizeOutputSchema } from "./schemas";

function clip(s: string, maxChars: number) {
  return s.length > maxChars ? s.slice(0, maxChars) : s;
}

function normalizeSummary(s: string) {
  const t = s
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return t.slice(0, 2500);
}
export async function summarize(text: string) {
  const { text: raw } = SummarizeInputSchema.parse({ text });

  const clipped = clip(raw, 4000);
  const model = getChatModel({ temperature: 0.2 });

  const res = await model.invoke([
    new SystemMessage(
      [
        "You are a precise and neutral summarization assistant.",
        "Your task is to produce a short, clear, beginner-friendly summary.",
        "",
        "Rules:",
        "- Use 5–8 complete sentences.",
        "- Be factual and neutral. Do not use promotional or opinionated language.",
        "- Do not add information that is not present in the provided text.",
        "- Do not invent sources, statistics, or context.",
        "- Avoid bullet points unless absolutely necessary.",
        "- Keep the language simple and easy to understand.",
        "- Focus only on the most important facts and main ideas.",
      ].join("\n"),
    ),

    new HumanMessage(
      [
        "Summarize the following text for a beginner audience.",
        "Remove unnecessary details, repetition, and filler.",
        "Highlight only the key facts and essential information.",
        "",
        "TEXT:",
        clipped,
      ].join("\n"),
    ),
  ]);

  const rawModelOutput =
    typeof res.content === "string" ? res.content : String(res.content);
  const summary = normalizeSummary(rawModelOutput);

  return SummarizeOutputSchema.parse({ summary });
}
