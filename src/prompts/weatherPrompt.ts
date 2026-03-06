import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

export function registerWeatherPrompt(server: McpServer) {

  server.registerPrompt(
    "weather_advisor",
    {
      title: "Weather Advisor",
      description: "Generate advice based on weather conditions",
      argsSchema: {
        city: z.string(),
        temperature: z.string(),
        condition: z.string(),
      },
    },
    async ({ city, temperature, condition }) => {

      return {
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: "You are a weather expert giving practical outdoor advice.",
            },
          },
          {
            role: "user",
            content: {
              type: "text", text: `City: ${city}Temperature: ${temperature} Condition: ${condition}Give practical advice for someone going outside.`,
            },
          },
        ],
      }
    }
  )
}