import { tool } from "langchain";
import extractInfo from "./helpers/extractInfo.js";
import z from "zod";
import { tavily } from "@tavily/core";
import { createEmbeddings } from "./createEmbeddings.js";
export const searchDatabaseTool = tool(
  async ({ query }) => {
    console.log("search internally started");
    const queryVector = await createEmbeddings(query);
    const results = await searchEmbeddings({
      queryEmbeddings: queryVector,
      limit: 3,
    });
    let found = true;

    if (results.length === 0 || results[0].score < 0.7) {
      found = false;
      return JSON.stringify({
        found: false,
        results: [],
      });
    }

    return JSON.stringify({
      found: found,
      results,
    });
  },
  {
    name: "search_internally",
    description:
      "Searches our curated database of hidden gems. USE THIS FIRST.",
    schema: z.object({ query: z.string() }),
  },
);
export const findOutSidePlacesTool = tool(
  async ({ query }) => {
    const client = tavily({ apiKey: process.env.TAVILY_KEY });
    const result = await client.search(query, {
      searchDepth: "advanced",
      includeImages: true,
    });
    const places = result.results.map((item) => ({
      name: item.title,
      location: extractInfo(item.content),
      description: item.content.slice(0, 300),
      image: item.images?.[0] || result.images?.[0] || null,
      url: item.url,
    }));
    console.log(places);
    return JSON.stringify({
      found: false,
      places,
    });
  },
  {
    name: "search_externally",
    description: "Searches the web when internal database has no results",
    schema: z.object({
      query: z.string(),
    }),
  },
);
