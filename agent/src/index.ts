import express from "express";
import "dotenv/config";
import cors from "cors";
import { searchRouter } from "./routes/search_lcel";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
  }),
);

app.use("/api/search", searchRouter);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
