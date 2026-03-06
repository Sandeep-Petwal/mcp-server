import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

const weatherData: Record<string, any> = {
  delhi: { temperature: "28°C", condition: "Sunny" },
  london: { temperature: "12°C", condition: "Cloudy" },
  tokyo: { temperature: "18°C", condition: "Windy" },
  shimla: { temperature: "2°C", condition: "Snowy" },
}

export function registerWeatherTool(server: McpServer) {

  const handleGetWeather = async ({ city }: { city: string }) => {
    const key = city.toLowerCase()
    const weather = weatherData[key]

    if (!weather) {
      return {
        // MCP tools return content in a specific format
        // The content array can contain multiple items of different types
        content: [
          {
            type: "text" as const, // Content type - can be text, image, etc.
            text: `Weather in ${city}: 0°C, Very cold and high chance of snow`,
          },
        ],
      }
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Weather in ${city}: ${weather.temperature}, ${weather.condition}`,
        },
      ],
    }
  }



  // This makes the tool available to AI models that connect to this server
  server.registerTool(
    "get_weather", // Unique tool identifier - used by AI models to call this tool
    {
      title: "Get Weather", 
      description: "Get weather for a city",
      inputSchema: {
        city: z.string(),
      },

      // Tool annotations provide metadata about tool behavior
      annotations: {
        readOnlyHint: true,   
        destructiveHint: false, 
        idempotentHint: true, 
        openWorldHint: false,  
      },
    },
    handleGetWeather 
  )
}

