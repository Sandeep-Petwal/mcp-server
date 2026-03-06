import { input, select } from "@inquirer/prompts";
import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";


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







// Main client function 
const runClient = async () => {

    // Connect to the client
    await mcpClient.connect(transport);
    console.log("Mcp client connected successfully.")

    // Get all the available tools/resources/prompts from the server
    const [tools, resources, prompts] = await Promise.all([
        mcpClient.listTools(),
        mcpClient.listResources(),
        mcpClient.listPrompts()
    ])

    // console.log('tools', tools)
    console.log('resources', resources)
    // console.log('prompts', prompts)


    // Cli logic
    while (true) {

        // Read the input option from the clie
        const options = await select({
            message: "What would you like to do ?",
            choices: ['Query', 'Tools', 'Resources', 'Prompts']
        })

        switch (options) {
            case 'Tools':
                console.log("Running Tool");
                const toolName = await select({
                    message: "Please select a tool!",
                    choices: tools.tools.map(t => ({
                        name: t.title || t.name,
                        value: t.title || t.name,
                        descrption: t.description || ''
                    })),
                })

                console.log('toolName', toolName)
                const tool = tools.tools.find(t => t.title == toolName);

                if (!tool) {
                    console.error("Tool not fount");
                } else {
                    await handleRunTool(tool);
                }
                break;

            case 'Resources':
                console.log("Running Tool");
                const resourceUrl = await select({
                    message: "Please select a resource!",
                    choices: resources.resources.map(t => ({
                        name: t.title || t.name,
                        value: t.uri,
                        descrption: t.description || ''
                    })),
                })

                console.log('resourceUrl', resourceUrl)
                const uri = resources.resources.find(t => t.uri == resourceUrl)?.uri

                if (!uri) {
                    console.error("Tool not fount");
                } else {
                    await handleResource(uri);
                }



            default:

        }
    }

}



// Run a tool
const handleRunTool = async (tool: Tool) => {

    const args: Record<string, string> = {}
    const toolInputOptions = tool.inputSchema.properties || {}

    for (const [key, value] of Object.entries(toolInputOptions)) {
        args[key] = await input({
            message: `Enter value for (${key} ${(value as { type: string }).type}) : `
        })
    }


    // call the tool
    const res = await mcpClient.callTool({
        name: tool.name,
        arguments: args
    })

    console.log((res.content as [{ text: string }])[0].text)

}

// Handle resource type
const handleResource = async (uri : string) => {

}



runClient();