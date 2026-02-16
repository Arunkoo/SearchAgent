import { RunnableLambda } from "@langchain/core/runnables";
import { webSearch } from "../../utils/webSearch";
import { openUrl } from "../../utils/openUrl";
import { summarize } from "../../utils/summarize";

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
