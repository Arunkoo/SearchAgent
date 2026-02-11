import { OpenUrlOutputSchema } from "./schemas";
import { safeText } from "./webSearch";
import { convert } from "html-to-text";


export async function openUrl(url: string) {
  const normalizedUrl = validateUrl(url);

  //   fetch page mannually...
  const res = await fetch(normalizedUrl, {
    headers: {
      "User-Agent": "agent-core/1.0 (+course demo)",
    },
  });
  if (!res.ok) {
    const body = await safeText(res);
    throw new Error(`OpenUrl failed ${res.status}-${body.slice(0, 200)}`);
  }
  const contentType = res.headers.get("content-type") ?? "";

  const raw = await res.text();

  const text = contentType.includes("text/html")
    ? convert(raw, {
        wordwrap: false,
        selectors: [
          { selector: "nav", format: "skip" },
          { selector: "headers", format: "skip" },
          { selector: "footer", format: "skip" },
          { selector: "script", format: "skip" },
          { selector: "style", format: "skip" },
        ],
      })
    : raw;

  const cleaned = collapseWhiteSpaces(text);
  const capped = cleaned.slice(0, 8000);
  return OpenUrlOutputSchema.parse({
    url: normalizedUrl,
    content: capped,
  });
}

function collapseWhiteSpaces(s: string) {
  return s.replace(/\s+/g, " ").trim();
}
function validateUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) {
      throw new Error(`only http/https are supported`);
    }

    return parsed.toString();
  } catch (error) {
    throw new Error("Invalid Url");
  }
}
