import { confirm, input, select } from "@inquirer/prompts";
import { Client } from "@modelcontextprotocol/sdk/client";
import OpenAI from 'openai';


export class PromptHandler {
    constructor(private client: Client) { }

    async handlePrompts(prompts: any[]) {
        const promptName = await select({
            message: "Please select prompt - ",
            choices: prompts.map(p => ({
                name: p.title || p.name,
                value: p.name,
                description: p.description || ''
            })),
        });

        const prompt = prompts.find(p => p.name === promptName);
        if (!prompt) {
            console.error("Prompt not found");
            return;
        }

        await this.runPrompt(prompt);
    }

    private async runPrompt(prompt: any) {
        // collect arguments for the prompt
        const args: Record<string, any> = {};

        if (prompt.arguments) {
            for (const arg of prompt.arguments) {
                if (arg.required) {
                    args[arg.name] = await input({
                        message: `Enter value for ${arg.name} (${arg.description || 'No description'}) : `
                    });
                }
            }
        }

        // get  prompt
        const res = await this.client.getPrompt({
            name: prompt.name,
            arguments: args
        });

        // display prompt result
        console.log('Prompt messages : ', JSON.stringify(res.messages, null, 2))

        // ask user if they want to run this prompt 

        const runPrompt = await confirm({
            message: "Do you want to run this prompt ? ",
            default: false
        })

        if (runPrompt) {
            // get the api key first
            const apiKey = await input({
                message: `Please provide the gemin api key  : `
            });

            if (!apiKey) return

            await this.handleAICall(apiKey, res.messages)
        }

    }


    private async handleAICall(apiKey: string, messages: any[]) {

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
        });

        const constructedMessage = messages.map((msg: any) => ({
            role: msg.role,
            content: typeof msg.content === 'string' ? msg.content : msg.content?.text || JSON.stringify(msg.content)
        }))

        try {
            console.warn("Thinking ......")
            const response = await openai.chat.completions.create({
                model: "gemini-3-flash-preview",
                messages: constructedMessage
            });

            console.log(response.choices[0].message.content);

        } catch (error) {
            console.error("Error calling AI API:", error);
        }
    }


}
