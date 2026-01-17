import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { tool } from "langchain";

import { tavily } from "@tavily/core";
import { createEmbeddings } from "./createEmbeddings.js";
import { searchEmbeddings } from "../repository/gem.repo.js";
import { z } from "zod";
import { ChatGroq } from "@langchain/groq";
import executeSearch from "./executeAgentSearch.js";
import { findOutSidePlacesTool, searchDatabaseTool } from "./tools.js";
config();


export const agenticMode = async (query) => {
  //commit comment test deploy
  const model = new ChatGroq({
    apiKey: process.env.GROQ_KEY,
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0,
  });

  const tools = [searchDatabaseTool, findOutSidePlacesTool];
  const modelWithTools = model.bindTools(tools);

  return executeSearch(modelWithTools, query);
};
