import { z } from "zod";

export const webSearchResultSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
  snippet: z.string().optional().default(""),
});

export const webSearchResultsSchema = z.array(webSearchResultSchema).max(10);

export type SearchResult = z.infer<typeof webSearchResultsSchema>;
