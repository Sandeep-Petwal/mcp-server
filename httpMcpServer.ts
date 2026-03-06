// Must read : https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md

import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { registerWeatherTool } from "./src/tools/weatherTool.js"
import { registerUserResources } from "./src/resources/userResources.js"
import { registerWeatherPrompt } from "./src/prompts/weatherPrompt.js"

const app = createMcpExpressApp()

function createServer() {
    const server = new McpServer(
        {
            name: "weather_http_server",
            version: "1.0.0"
        },
        {
            capabilities: {
                tools: {},
                resources: {},
                prompts: {}
            }
        }
    )

    registerWeatherTool(server)
    registerUserResources(server)
    registerWeatherPrompt(server)

    return server
}

// // POST /mcp → JSON response
// // POST /mcp → OR SSE stream
// // The same endpoint supports both.

app.post("/mcp", async (req, res) => {
    console.error("Request received at /mcp:", req.method, req.url)

    const server = createServer()

    try {
        // // So the transport layer is responsible for:
        // // HTTP request
        // // → JSON-RPC parsing
        // // → MCP server execution
        // // → response / streaming

        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined
        })

        await server.connect(transport)

        await transport.handleRequest(req, res, req.body)

        res.on("close", () => {
            transport.close()
            server.close()
        })

    } catch (error) {

        console.error("MCP error:", error)

        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: "2.0",
                error: {
                    code: -32603,
                    message: "Internal server error"
                },
                id: null
            })
        }
    }
})

const PORT = 3000

app.listen(PORT, () => {
    console.log(`MCP HTTP server running at http://localhost:${PORT}/mcp`)
})
















//         MCP SERVER
// ┌─────────────────────────┐
// │ tools                   │
// │ resources               │
// │ prompts                 │
// └─────────────────────────┘
//          │
//  StreamableHTTPTransport
//          │
//        /mcp
// ┌───────────────┐
// │ JSON responses│
// │ SSE streaming │
// └───────────────┘