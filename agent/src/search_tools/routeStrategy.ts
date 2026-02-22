import { RunnableLambda } from "@langchain/core/runnables";
import { patterns } from "./types.js";
import { SearchInputSchema } from "../utils/schemas.js";

export function routeStrategy(q: string): "web" | "direct" {
  const trimmedQuery = q.toLowerCase().trim();

  const isLongQuery = trimmedQuery.length > 70;

  const isQueryPresentInPattern = patterns.some((pattern) =>
    pattern.test(trimmedQuery),
  );

  if (isLongQuery || isQueryPresentInPattern) {
    return "web";
  } else {
    return "direct";
  }
}

//routerStep....
export const routerStep = RunnableLambda.from(async (input: { q: string }) => {
  const { q } = SearchInputSchema.parse(input);

  //decide the mode....

  const mode = routeStrategy(q);

  return { q, mode };
});
