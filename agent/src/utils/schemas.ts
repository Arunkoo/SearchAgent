import { z } from "zod";

export const webSearchResultSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
  snippet: z.string().optional().default(""),
});

export const webSearchResultsSchema = z.array(webSearchResultSchema).max(10);

export type SearchResult = z.infer<typeof webSearchResultsSchema>;

export const OpenUrlInputSchema = z.object({
  url: z.url(),
});

export const OpenUrlOutputSchema = z.object({
  url: z.url(),
  content: z.string().min(1),
});

export const SummarizeInputSchema = z.object({
  text: z.string().min(50, "Need at least 50 characters to summarize"),
});

export const SummarizeOutputSchema = z.object({
  summary: z.string().min(1),
});

export const SearchInputSchema = z.object({
  q: z.string().min(5, "Please ask a specific query"),
});

export type SearchInput = z.infer<typeof SearchInputSchema>;
