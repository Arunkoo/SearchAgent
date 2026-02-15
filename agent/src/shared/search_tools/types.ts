// web result--->  browse-->summary--->source/citation..
//direct path---> LLM, no browsing, llm send response...

export type candidate = {
  answer: string;
  sources: string[];
  mode: "web" | "direct";
};

export const patterns: RegExp[] = [
  // Real-time / recency indicators
  /\b(latest|current|today|now|recent|live|trending|breaking|currently|right now)\b/i,

  // Relative time references
  /\b(this year|this month|this week|yesterday|tomorrow)\b/i,

  // Future / recent years (2024+)
  /\b20(2[4-9]|3[0-9])\b/i,

  // Financial / pricing / markets
  /\b(price|cost|how much|rate|exchange rate|stock|share price|market cap|valuation|crypto|bitcoin|ethereum|nifty|sensex)\b/i,

  // Commodities
  /\b(gold price|silver price|oil price)\b/i,

  // Company metrics
  /\b(net worth|revenue|profit|earnings)\b/i,

  // Economic indicators
  /\b(gdp|inflation|interest rate|repo rate|cpi)\b/i,

  // Sports results
  /\b(score|who won|match result|standing|points table)\b/i,

  // Elections / political results
  /\b(election result|poll result)\b/i,

  // Product / software updates
  /\b(release date|version|launched|announced|update)\b/i,

  // Statistics / dynamic numbers
  /\b(population|statistics|stats|data)\b/i,

  // Explicit web intent
  /\b(search|look up|google|check online|browse)\b/i,

  // Currency / numeric money pattern
  /\b(\$|₹|€|£)\s?\d+|\d+\s?(usd|inr|dollars?|rupees?|crore|billion|million)\b/i,
];
