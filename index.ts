import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import { registerWeatherTool } from "./src/tools/weatherTool.js"
import { registerUserResources } from "./src/resources/userResources.js"
import { registerWeatherPrompt } from "./src/prompts/weatherPrompt.js"

// This creates the main server instance that will handle all MCP communications
const server = new McpServer(
  {
    // Server metadata - used by clients to identify and describe this server
    name: "weather_data",
    version: "1.0.0",
    description: "Weather Data provider from the city name."
  },
  {
    // MCP Server Capabilities - these define what this server can do
    capabilities: {
      tools: {},        // Can execute tools (functions) that clients can call
      resources: {},    // Can provide resources (data files, database queries, etc.)
      prompts: {}       // Can provide prompts (templates for AI interactions)
    }
  }
)

// Register all MCP modules with the server
registerWeatherTool(server)
registerUserResources(server)
registerWeatherPrompt(server)


const runWeatherMcp = async () => {
  // Create the transport layer for MCP communication
  // StdioServerTransport enables communication via standard input/output
  // This is the most common transport for MCP servers
  // Other options include HTTP transport for web-based communication
  const transport = new StdioServerTransport()
  
  // This starts the server and makes it ready to handle MCP requests
  await server.connect(transport)

  // Log server startup (use console.error for MCP server logs)
  // MCP servers use stderr for logging to avoid interfering with JSON-RPC communication
  console.error("MCP server started")
}

runWeatherMcp()