import { input, select } from "@inquirer/prompts";
import { Client } from "@modelcontextprotocol/sdk/client";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export class ToolHandler {
    constructor(private client: Client) {}

    async handleTools(tools: Tool[]) {
        const toolName = await select({
            message: "Please select a tool!",
            choices: tools.map(t => ({
                name: t.title || t.name,
                value: t.title || t.name,
                description: t.description || ''
            })),
        });

        console.log('toolName', toolName);
        const tool = tools.find(t => t.title === toolName);

        if (!tool) {
            console.error("Tool not found");
            return;
        }

        await this.runTool(tool);
    }

    private async runTool(tool: Tool) {
        const args: Record<string, string> = {};
        const toolInputOptions = tool.inputSchema?.properties || {};

        for (const [key, value] of Object.entries(toolInputOptions)) {
            args[key] = await input({
                message: `Enter value for (${key} ${(value as { type: string }).type}) : `
            });
        }

        // call tool
        const res = await this.client.callTool({
            name: tool.name,
            arguments: args
        });

        console.log((res.content as [{ text: string }])[0].text);
    }
}
