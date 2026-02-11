import { SystemMessage } from "@langchain/core/messages";
import { getChatModel } from "../shared/model";
import { SummarizeInputSchema, SummarizeOutputSchema } from "./schemas";


function clip(s: string, maxChars: number) {
  return s.length > maxChars ? s.slice(0, maxChars) : s;
}
export async function summarize(text: string) {
  const { text:raw } = SummarizeInputSchema.parse({ text });

  const clipped = clip(raw,4000);
  const model = getChatModel({temperature:0.2})

  const res = await model.invoke([
    new SystemMessage(["you are a helpful assistant that summarizes text.", "Guidelines:", ". Be concise and to the point.", ". Use the same language as the text.", ". Don't add any other text than the summary."]),
  ])
}
