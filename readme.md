# LCEL SearchAgent

A small Express + TypeScript service that answers questions using an LLM.  
It automatically chooses between two paths:

- **Direct mode:** respond from the model only (no browsing)
- **Web mode:** search the web, open top pages, summarize them, then answer with source URLs

The goal is to keep answers short and beginner-friendly while returning structured JSON output.

<img src="/docs/Search Agent.png" alt="App preview" width="900" />

## What this API does

High Level Design-->
<img src="/docs/hldSA.png" alt="App preview" width="900" />
When you send a query to the API:

1. The request is validated with **Zod**.
2. A router step decides the mode:
   - Uses **direct** for normal / stable questions
   - Switches to **web** if the query looks time-sensitive, numeric, price-related, trending, “latest”, etc.
3. **Direct mode**
   - Calls the chat model once
   - Returns `{ answer, sources: [] }`
4. **Web mode**
   - Uses Tavily Search to get results
   - Opens the top pages (HTTP fetch)
   - Converts HTML to text and caps content length
   - Summarizes each page with the model
   - Composes a final answer using only those summaries
   - Returns `{ answer, sources: [url, ...] }`
5. Final output is validated again with Zod, and repaired once if needed.

## Tech stack

- Node.js + TypeScript
- Express
- LangChain (RunnableSequence, RunnableBranch)
- Zod (input/output validation)
- Tavily Search API (web search)
- html-to-text (cleaning page HTML)
- CORS configured for a single allowed frontend origin

## API

### POST `/api/search`

**Request body**

```json
{
  "q": "your question here"
}
```

**Success Response**

```json
{
  "answer": "string",
  "sources": ["https://example.com", "https://example2.com"]
}
```
