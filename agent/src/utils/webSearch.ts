import { env } from "../shared/env";
import { webSearchResultSchema, webSearchResultsSchema } from "./schemas";

// safeText....
export async function safeText(res: Response) {
  try {
    return await res.json();
  } catch (error) {
    return "<no body>";
  }
}

async function searchTavilyUtils(query: string) {
  if (!env.TAVILY_API_KEY) {
    throw new Error("No Tavily key is avaliable");
  }
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      max_results: 5,
      include_answer: false,
      include_images: false,
    }),
  });

  if (!response.ok) {
    const text = await safeText(response);
    throw new Error(`Tavily Error, ${response.status}-${text}`);
  }
  const data = await response.json();
  const result = Array.isArray(data?.results) ? data.results : (Array.isArray(data?.result) ? data.result : []);

  const normalized = result.slice(0, 5).map((r: any) =>
    webSearchResultSchema.parse({
      title: String(r?.title ?? "").trim() || "Untitled",
      url: String(r?.url ?? "").trim(),
      snippet: String(r?.content ?? "")
        .trim()
        .slice(0, 220),
    }),
  );

  return webSearchResultsSchema.parse(normalized);
}

export async function webSearch(q: string) {
  const query = (q ?? "").trim();

  if (!query) return [];

  return await searchTavilyUtils(query);
}
