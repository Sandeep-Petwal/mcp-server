import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

import { registerWeatherTool } from "./src/tools/weatherTool.js"
import { registerUserResources } from "./src/resources/userResources.js"
import { registerWeatherPrompt } from "./src/prompts/weatherPrompt.js"

const server = new McpServer(
  {
    name: "weather_data",
    version: "1.0.0",
    description: "Weather Data provider from the city name."
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    }
  }
)

// register modules
registerWeatherTool(server)
registerUserResources(server)
registerWeatherPrompt(server)

const runWeatherMcp = async () => {
  const transport = new StdioServerTransport()
  await server.connect(transport)

  // Use console.error for logs
  console.error("MCP server started")
}

runWeatherMcp()