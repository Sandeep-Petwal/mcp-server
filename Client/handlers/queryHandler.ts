import { input } from "@inquirer/prompts";
import { Client } from "@modelcontextprotocol/sdk/client";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import OpenAI from "openai";

export class QueryHandler {
    constructor(private client: Client) { }

    async handleQuery(tools: Tool[]) {

        // get the query from the user
        const query = await input({ message: "Enter your query : ", });
        const apiKey = process.env.GEMINI_API_KEY || await input({ message: "Enter your API key : ", });

        await this.runQuery(query, apiKey, tools);
    }



    private async runQuery(query: string, apiKey: string, tools: Tool[]) {
        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
        });

        const openAiTools = tools.map((t) => ({
            type: "function",
            function: {
                name: t.name,
                description: t.description || t.title || "",
                parameters: (t.inputSchema as any) || { type: "object", properties: {} }
            }
        }))

        // console.error("OpenAI tools:", JSON.stringify(openAiTools, null, 2))

        // https://developers.openai.com/api/docs/guides/function-calling/
        // Expose MCP tools to the model via tools: [{ type: "function", function: { name, description, parameters } }]
        // Detect tool calls in the model response (message.tool_calls)
        // Execute each tool via this.client.callTool({ name, arguments })
        // Append tool outputs back into the chat as { role: "tool", tool_call_id, content }
        // Repeat in a loop until the model returns a normal assistant message (no more tool calls)

        const maxToolCallingIterations = 3;

        try {
            console.log("Thinking ......")
            const messages: any[] = [{ role: "user", content: query }]

            for (let i = 0; i < maxToolCallingIterations; i++) {
                console.log(`\n\nIteration ${i + 1}`)
                const response = await openai.chat.completions.create({
                    model: "gemini-2.5-flash-lite",
                    messages,
                    tools: openAiTools,
                    tool_choice: "auto"
                } as any)

                const message = response.choices?.[0]?.message

                const toolCalls = (message as any)?.tool_calls as any[] | undefined
                // console.log("Tool calls:", JSON.stringify(toolCalls, null, 2))
                // console.log("Message:", JSON.stringify(message, null, 2))
                // no more tool calls - final response
                if (!toolCalls || toolCalls.length === 0) {
                    console.log("Final output:")
                    console.log(message?.content ?? "")
                    return
                }

                messages.push({
                    role: "assistant",
                    content: message?.content ?? null,
                    tool_calls: toolCalls
                })

                /// Execute each tool
                for (const tc of toolCalls) {
                    const toolName = tc?.function?.name
                    const rawArgs = tc?.function?.arguments
                    let parsedArgs: Record<string, any> = {}

                    try {
                        parsedArgs = rawArgs ? JSON.parse(rawArgs) : {}
                    } catch {
                        parsedArgs = {}
                    }

                    const toolResult = await this.client.callTool({
                        name: toolName,
                        arguments: parsedArgs
                    })

                    const toolText = Array.isArray((toolResult as any)?.content)
                        ? ((toolResult as any).content[0]?.text ?? JSON.stringify((toolResult as any).content))
                        : JSON.stringify((toolResult as any)?.content ?? toolResult)

                    console.error("Tool result:", toolText)

                    messages.push({
                        role: "tool",
                        tool_call_id: tc.id,
                        content: toolText
                    })
                }
            }

            console.log("Final output:")
            console.log("Tool-calling loop reached max iterations without a final response.")

        } catch (error) {
            console.error("Error calling AI API:", error);
            const err = error as any
            if (err?.status === 404) {
                console.error(
                    "Received 404 from the OpenAI-compatible endpoint. ."
                )
            }
        }
    }

}
