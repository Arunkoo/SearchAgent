import { RunnableLambda } from "@langchain/core/runnables";
import { candidate } from "./types";
import { getChatModel } from "../shared/model";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export const directPath = RunnableLambda.from(
  async (input: { q: string; mode: "web" | "direct" }): Promise<candidate> => {
    const model = getChatModel({ temperature: 0.2 });

    const res = await model.invoke([
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
      typeof res.content === "string" ? res.content : String(res.content)
    ).trim();

    return {
      answer: directAns,
      sources: [],
      mode: "direct",
    };
  },
);
