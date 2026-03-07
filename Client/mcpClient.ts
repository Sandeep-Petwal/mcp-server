import { select } from "@inquirer/prompts";
import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

import { ToolHandler } from "./handlers/toolHandler.js";
import { ResourceHandler } from "./handlers/resourceHandler.js";
import { PromptHandler } from "./handlers/promptHandler.js";
import { ShutdownHandler } from "./handlers/shutdownHandler.js";
import OpenAI from "openai";
import { QueryHandler } from "./handlers/queryHandler.js";

const mcpClient = new Client({
    name: "test_client",
    title: "Test Client",
    version: "1.0.0",
    description: "A test client for learning purposes",
}, {
    capabilities: {
        sampling: {}
    }
})

// Transport
// HTTP transport
const serverUrl = new URL('http://localhost:3000/mcp')
const transport = new StreamableHTTPClientTransport(serverUrl)






const runClient = async () => {

    await mcpClient.connect(transport);
    console.log("Mcp client connected successfully.")

    // Get all the available tools/resources/prompts from the server
    // here resourceTemplates are resources with dynamic URI patterns
    const [tools, { resources }, { resourceTemplates }, { prompts }] = await Promise.all([
        mcpClient.listTools(),
        mcpClient.listResources(),
        mcpClient.listResourceTemplates(),
        mcpClient.listPrompts()
    ])

    // Initialize handlers
    const toolHandler = new ToolHandler(mcpClient);
    const resourceHandler = new ResourceHandler(mcpClient);
    const promptHandler = new PromptHandler(mcpClient);
    const queryHandler = new QueryHandler(mcpClient);

    console.log('tools.tools', tools.tools)
    // console.log('resources', resources)
    // console.log('ResourceTemplate', resourceTemplates)
    // console.log('prompts', prompts)


    // to keep the cli logic running
    while (true) {
        // Read the input option from the clie
        const options = await select({
            message: "What would you like to do ?",
            choices: ['Query', 'Tools', 'Resources', 'Prompts', 'Exit']
        })

        switch (options) {
            case 'Query':
                await queryHandler.handleQuery(tools.tools);
                break;
            case 'Tools':
                await toolHandler.handleTools(tools.tools);
                break;

            case 'Resources':
                await resourceHandler.handleResources(resources, resourceTemplates);
                break;

            case 'Prompts':
                await promptHandler.handlePrompts(prompts);
                break;

            case 'Exit':
                console.log("Exiting client...");
                await shutdownHandler.gracefulShutdown();
                return;

            default:
                console.log("Invalid option. Please choose a valid option.");
        }
    }

}




runClient();


// Initialize shutdown handlers
const shutdownHandler = new ShutdownHandler(mcpClient, transport);
shutdownHandler.initializeHandlers();
