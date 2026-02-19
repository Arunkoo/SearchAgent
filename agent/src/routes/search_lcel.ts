import { Router } from "express";
import { SearchInputSchema } from "../utils/schemas";
import { runSearch } from "../search_tools/searchChain";

export const searchRouter = Router();

searchRouter.post("/", async (req, res) => {
  try {
    const input = SearchInputSchema.parse(req.body);
    const result = await runSearch(input);
    res.status(200).json(result);
  } catch (e) {
    const msg = (e as Error)?.message ?? "Unkown error occured";
    res.status(400).json({ error: msg });
  }
});
