// answer , sources

import { RunnableLambda } from "@langchain/core/runnables";
import { candidate } from "./types.js";
import { SearchAnswerSchema } from "../utils/schemas.js";
import { getChatModel } from "../shared/model.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export const finalValidation = RunnableLambda.from(
  async (candidate: candidate) => {
    const finalDraft = {
      answer: candidate.answer,
      sources: candidate.sources ?? [],
    };
    const parsed1 = SearchAnswerSchema.safeParse(finalDraft);
    if (parsed1.success) return parsed1.data;

    //if again the structure of data is not valid than repair one shot..
    const oneShotRepair = await repairSearchAns(finalDraft);
    const parsed2 = SearchAnswerSchema.safeParse(oneShotRepair);
    if (parsed2.success) return parsed2.data;
  },
);

async function repairSearchAns(
  obj: any,
): Promise<{ answer: string; sources: string[] }> {
  const model = getChatModel({ temperature: 0.2 });

  const res = await model.invoke([
    new SystemMessage(
      [
        "You fix broken JSON objects into given Schema",
        "Respond only with valid JSON object",
        "Schema: {answer: string; sources: string[] (urls as strings)}",
      ].join("\n"),
    ),
    new HumanMessage(
      [
        "Make this exactly to the schema. Ensure sources is an array of URL strings",
        "Input JSON:",
        JSON.stringify(obj),
      ].join("\n"),
    ),
  ]);
  //validation and transformation....
  const text = (
    typeof res.content === "string" ? res.content : String(res.content)
  ).trim();
  const json = extractJson(text);
  return {
    answer: String(json?.answer ?? "").trim(),
    sources: Array.isArray(json?.sources) ? json?.sources?.map(String) : [],
  };
}

function extractJson(input: string) {
  const start = input.indexOf("{");
  const end = input.indexOf("}");
  if (start === -1 || end === -1 || end <= start) return {};

  try {
    return JSON.parse(input.slice(start, end + 1));
  } catch {
    return {};
  }
}
