// Must read : https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md

import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { registerWeatherTool } from "./src/tools/weatherTool.js"
import { registerUserResources } from "./src/resources/userResources.js"
import { registerWeatherPrompt } from "./src/prompts/weatherPrompt.js"

console.log("PID:", process.pid)

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

    // stateless server
    // every request creates a new MCP server instance
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
            res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null })
        }
    }
})



app.get("/mcp", (req, res) => {
    res.status(405).json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null })
})

app.delete("/mcp", (req, res) => {
    res.status(405).json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null })
})


const PORT = 3000

try {
    const server = app.listen(PORT, () => {
        console.log(`MCP HTTP server running at http://localhost:${PORT}/mcp`)
    })

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('Received SIGINT, shutting down gracefully')
        server.close(() => {
            console.log('Server closed')
            process.exit(0)
        })
    })

    process.on('SIGTERM', () => {
        console.log('Received SIGTERM, shutting down gracefully')
        server.close(() => {
            console.log('Server closed')
            process.exit(0)
        })
    })

} catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
}











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