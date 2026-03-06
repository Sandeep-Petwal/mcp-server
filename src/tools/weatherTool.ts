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
        content: [
          {
            type: "text" as const,
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



  server.registerTool(
    "get_weather",
    {
      title: "Get Weather",
      description: "Get weather for a city",

      inputSchema: {
        city: z.string(),
      },

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

