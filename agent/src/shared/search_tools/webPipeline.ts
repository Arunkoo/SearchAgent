import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { webSearch } from "../../utils/webSearch";
import { openUrl } from "../../utils/openUrl";
import { summarize } from "../../utils/summarize";
import { candidate } from "./types";
import { getChatModel } from "../model";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const setTopResults = 5;

// web search steps....     //search every page and written capped results... {url, title, content}
export const webSearchStep = RunnableLambda.from(
  async (ctx: { q: string; mode: "web" | "direct" }) => {
    const results = await webSearch(ctx.q);

    return {
      ...ctx,
      results,
    };
  },
);

//openAndSummarizeStep....
export const openAndSummarizeStep = RunnableLambda.from(
  async (input: { q: string; mode: "web" | "direct"; results: any[] }) => {
    if (!Array.isArray(input.results) || input.results.length === 0) {
      return {
        ...input,
        pageSummaries: [],
        fallback: "no result" as const,
      };
    }

    const extractTopResults = input.results.slice(0, setTopResults);

    const settledResults = await Promise.allSettled(
      extractTopResults.map(async (result: any) => {
        const opened = await openUrl(result.url);
        const summarizeContent = await summarize(opened.content);

        return {
          url: opened.url,
          summary: summarizeContent.summary,
        };
      }),
    );

    const settledResultsPageSummaries = settledResults
      .filter((settledResult) => settledResult.status === "fulfilled")
      .map((s) => s.value);

    //edge case: if all settled every case rejects..
    if (settledResultsPageSummaries.length === 0) {
      const fallbackSnippetSummaries = extractTopResults
        .map((result: any) => ({
          url: result.url,
          summary: String(result.snippet || result.title || "").trim(),
        }))
        .filter((x: any) => x.summary.length > 0);

      return {
        ...input,
        pageSummaries: fallbackSnippetSummaries,
        fallback: "snippets" as const,
      };
    }

    return {
      ...input,
      pageSummaries: settledResultsPageSummaries,
      fallback: "none" as const,
    };
  },
);

//compose step....

export const stepCompose = RunnableLambda.from(
  async (input: {
    q: string;
    pageSummaries: Array<{ url: string; summary: string }>;
    mode: "web" | "direct";
    fallback: "no-results" | "snippets" | "none";
  }): Promise<candidate> => {
    const model = getChatModel({ temperature: 0.2 });
    //if no data reterived from web than just return llm messgae;;
    if (!input.pageSummaries || input.pageSummaries.length === 0) {
      const directResFromModel = await model.invoke([
        new SystemMessage(
          [
            "You answer briefly and clearly for beginners",
            "If unsure, say no gracefully",
          ].join("\n"),
        ),
        new HumanMessage(input.q),
      ]);
      //validation and transformation....
      const directAns = (
        typeof directResFromModel.content === "string"
          ? directResFromModel.content
          : String(directResFromModel.content)
      ).trim();

      return {
        answer: directAns,
        sources: [],
        mode: "direct",
      };
    }

    // if data retirvied....
    const res = await model.invoke([
      new SystemMessage(
        [
          "You concisely answer questions using provided page summaries",
          "Rules:",
          "- Be accurate and neutral",
          "- 5-8 sentences max",
          "-Use only the provided summaries; do not invent new facts",
        ].join("\n"),
      ),
      new HumanMessage(
        [
          `Question: ${input.q}`,
          "Summaries:",
          JSON.stringify(input.pageSummaries, null, 2),
        ].join("\n"),
      ),
    ]);

    const finalAns =
      typeof res.content === "string" ? res.content : String(res.content);
    const extractSources = input.pageSummaries.map((x) => x.url);
    return {
      answer: finalAns,
      sources: extractSources,
      mode: "web",
    };
  },
);

export const webPath = RunnableSequence.from([
  webSearchStep,
  openAndSummarizeStep,
  stepCompose,
]);
