import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { tool } from "langchain";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";
import { tavily } from "@tavily/core";
import { createEmbeddings } from "./createEmbeddings.js";
import { searchEmbeddings } from "../repository/gem.repo.js";
import { z } from "zod";
import { ChatGroq } from "@langchain/groq";
import { createAgent } from "langchain";
config();
const searchDatabaseTool = tool(
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
      return "I could not find any 'Hidden Gems' in our local database that match this request. Please try searching the web for broader results.";
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
  }
);
const findOutSidePlacesTool = tool(
  async ({ query }) => {
    const client = tavily({ apiKey: process.env.TAVILY_KEY });
    const result = await client.search(query, {
      searchDepth: "advanced",
      includeImages: true
    });
    return JSON.stringify({
      found: false,
      result,
    });
  },
  {
    name: "search_externally",
    description: "Searches the web when internal database has no results",
    schema: z.object({
      query: z.string(),
    }),
  }
);

export const agenticMode = async (query) => {
    //commit comment
  const model = new ChatGroq({
    apiKey: process.env.GROQ_KEY,
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0,
  });

  const tools = [searchDatabaseTool, findOutSidePlacesTool];
  const toolsByName = {
    search_internally: searchDatabaseTool,
    search_externally: findOutSidePlacesTool,
  };

  const modelWithTools = model.bindTools(tools);

  try {
    const messages = [
      new HumanMessage(`You are an Egypt Travel Assistant. 

### WORKFLOW
1. ALWAYS use 'search_internally' first to check our local database.
2. If 'search_internally' returns 'No results', then use 'search_externally'.
3. Be friendly and organize the itinerary by neighborhood.

User query: ${query}`),
    ];

    let iterations = 0;
    const maxIterations = 10;

    while (iterations < maxIterations) {
      iterations++;
      console.log(`\n=== Iteration ${iterations} ===`);

      // Call the model
      const response = await modelWithTools.invoke(messages);
      console.log("Response type:", response.constructor.name);
      console.log("Tool calls:", response.tool_calls);

      messages.push(response);

      // If no tool calls, we're done
      if (!response.tool_calls || response.tool_calls.length === 0) {
        console.log("No tool calls, returning final response");
        return response.content;
      }

      // Execute all tool calls
      for (const toolCall of response.tool_calls) {
        console.log(
          `Executing tool: ${toolCall.name} with args:`,
          toolCall.args
        );

        const tool = toolsByName[toolCall.name];
        if (!tool) {
          console.error(`Tool ${toolCall.name} not found`);
          continue;
        }

        try {
          const toolResult = await tool.invoke(toolCall.args);
          console.log(
            `Tool ${toolCall.name} result:`,
            toolResult.substring(0, 200)
          );

          // Add tool result to messages
          messages.push(
            new ToolMessage({
              content: toolResult,
              tool_call_id: toolCall.id,
            })
          );
        } catch (error) {
          console.error(`Error executing tool ${toolCall.name}:`, error);
          messages.push(
            new ToolMessage({
              content: `Error: ${error.message}`,
              tool_call_id: toolCall.id,
            })
          );
        }
      }
    }

    return "I reached the maximum number of iterations. Please try rephrasing your question.";
  } catch (error) {
    console.error("Agent Error:", error.message);
    console.error("Stack:", error.stack);
    return "I had trouble formatting the trip plan. Please try asking again in a different way.";
  }
};
