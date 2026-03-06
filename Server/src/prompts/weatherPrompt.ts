import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"

// This pattern allows modular registration of different prompt templates
export function registerWeatherPrompt(server: McpServer) {

  // This prompt helps AI models generate practical outdoor advice based on weather
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

    // It receives the arguments and returns a structured prompt for the AI model
    async ({ city, temperature, condition }) => {

      // Return the prompt in MCP format
      // Prompts contain messages that structure the AI conversation
      return {
        messages: [
          {
            role: "assistant", // System message that sets up the AI's role
            content: {
              type: "text",
              text: "You are a weather expert giving practical outdoor advice.",
            },
          },
          {
            role: "user", // User message that provides the actual task
            content: {
              type: "text",
              text: `City: ${city}Temperature: ${temperature} Condition: ${condition}Give practical advice for someone going outside.`
            },
          },
        ],
      }
    }
  )
}