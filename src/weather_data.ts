import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from 'zod'


const server = new McpServer({
    name: "weather_data",
    version: "1.0.0",
    description: "Weather Data provider from the city name.",
},
    {
        capabilities: {
            tools: {
                get_weather: {
                    description: "Get weather information for a city",
                },
            },
        },
    }

);



// Funtion to get the weather info
const weatherData: Record<string, any> = {
    delhi: { temperature: "28°C", condition: "Sunny" },
    london: { temperature: "12°C", condition: "Cloudy" },
    tokyo: { temperature: "18°C", condition: "Windy" },
    shimla: { temperature: "2°C", condition: "Snowy" },
}

const handleGetWeather = async ({ city }: { city: string }) => {
    const key = city.toLowerCase()
    const weather = weatherData[key]

    if (!weather) {
        return {
            content: [
                {
                    type: "text",
                    // Send dummy response 
                    text: `Weather in ${city} is  : 0°C, Condition : Very cold and high chance of snow`,
                },
            ],
        }
    }

    return {
        content: [
            {
                type: "text",
                text: `Weather in ${city}: ${weather.temperature}, ${weather.condition}`,
            },
        ],
    }
}


// Test 
// console.log( await handleGetWeather({city : 'simla'}))


// Create a tool
server.tool("get_weather", {
    city: z.string(),
}, handleGetWeather)




const runWeatherMcp = async () => {
    // Start receiving messages on stdin and sending messages on stdout
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("Weather MCP server started");
}

export { runWeatherMcp }