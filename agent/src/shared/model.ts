import { env } from "./env";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
//low temp --->crisp summary

type ModelOpts = {
  temperature?: number;
  maxToken?: number;
};

export function getChatModel(opts: ModelOpts): BaseChatModel {
  const temp = opts?.temperature ?? 0.2;

  switch (env.MODEL_PROVIDER) {
    case "gemini":
      return new ChatGoogleGenerativeAI({
        ...(env.GOOGLE_API_KEY && { apiKey: env.GOOGLE_API_KEY }),
        model: env.GEMINI_MODEL,
        temperature: temp,
      });
    case "groq":
      return new ChatGroq({
        ...(env.GROQ_API_KEY && { apiKey: env.GROQ_API_KEY }),
        model: env.GROQ_MODEL,
        temperature: temp,
      });
    case "openai":
    default:
      return new ChatOpenAI({
        ...(env.OPEN_API_KEY && { apiKey: env.OPEN_API_KEY }),
        model: env.OPENAI_MODEL,
        temperature: temp,
      });
  }
}
