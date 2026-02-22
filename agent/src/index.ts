import express from "express";
import "dotenv/config";
import cors from "cors";
import { searchRouter } from "./routes/search_lcel.js";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = process.env.ALLOWED_ORIGIN;

      // allow Postman / server-to-server (no origin)
      if (!origin) return cb(null, true);

      if (allowed && origin === allowed) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("*", cors());

app.use("/api/search", searchRouter);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
