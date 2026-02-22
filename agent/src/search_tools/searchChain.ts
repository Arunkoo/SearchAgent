import { RunnableBranch, RunnableSequence } from "@langchain/core/runnables";
import { webPath } from "./webPipeline.js";
import { directPath } from "./directPipeline.js";
import { routerStep } from "./routeStrategy.js";
import { finalValidation } from "./finalValidate.js";
import { SearchInput } from "../utils/schemas.js";

const branch = RunnableBranch.from<{ q: string; mode: "web" | "direct" }, any>([
  [(input) => input.mode === "web", webPath],
  directPath,
]);

export const searchChain = RunnableSequence.from([
  routerStep,
  branch,
  finalValidation,
]);

export async function runSearch(input: SearchInput) {
  return await searchChain.invoke(input);
}
