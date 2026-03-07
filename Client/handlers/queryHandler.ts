import { input } from "@inquirer/prompts";
import { Client } from "@modelcontextprotocol/sdk/client";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import OpenAI from "openai";

export class QueryHandler {
    constructor(private client: Client) { }

    async handleQuery(tools: Tool[]) {

        // get the query from the user
        const query = await input({ message: "Enter your query : ", });
        const apiKey = await input({ message: "Enter your API key : ", });


        await this.runQuery(query, apiKey);
    }



    private async runQuery(query: string, apiKey: string) {
        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
        });


        try {
            console.warn("Thinking ......")
            const response = await openai.responses.create({
                model: "gemini-2.5-flash-lite",
                input: [{ role: "user", content: query }]
            });

            //The model should be able to give a response!
            console.log("Final output:");
            console.log(JSON.stringify(response.output, null, 2));

        } catch (error) {
            console.error("Error calling AI API:", error);
        }
    }

}
