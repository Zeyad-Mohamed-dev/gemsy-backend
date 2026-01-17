import { createAgent } from "langchain";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";
import { findOutSidePlacesTool, searchDatabaseTool } from "./tools.js";
async function executeSearch(modelWithTools, query) {
    const toolsByName = {
    search_internally: searchDatabaseTool,
    search_externally: findOutSidePlacesTool,
  };
    let lastToolMessage = null;
    try {
    const messages = [
      new HumanMessage({
        content: `You are an Egypt Travel Assistant. 

### WORKFLOW
1. ALWAYS use 'search_internally' first to check our local database.
2. If 'search_internally' returns 'No results', then use 'search_externally'.
3. Be friendly and organize the itinerary by neighborhood.

User query: ${query}`,
        additional_kwargs: { tool_choice: { name: "search_internally" } },
      }),
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
        console.log("Last tool result is " + lastToolMessage);
        return JSON.parse(lastToolMessage);
        return response.content;
      }

      // Execute all tool calls
      for (const toolCall of response.tool_calls) {
        console.log(
          `Executing tool: ${toolCall.name} with args:`,
          toolCall.args,
        );

        const tool = toolsByName[toolCall.name];
        if (!tool) {
          console.error(`Tool ${toolCall.name} not found`);
          continue;
        }

        try {
          const toolResult = await tool.invoke(toolCall.args);
          lastToolMessage = toolResult;
          console.log(
            `Tool ${toolCall.name} result:`,
            toolResult.substring(0, 200),
          );

          // Add tool result to messages
          messages.push(
            new ToolMessage({
              content: toolResult,
              tool_call_id: toolCall.id,
            }),
          );
        } catch (error) {
          console.error(`Error executing tool ${toolCall.name}:`, error);
          messages.push(
            new ToolMessage({
              content: `Error: ${error.message}`,
              tool_call_id: toolCall.id,
            }),
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
}

export default executeSearch;