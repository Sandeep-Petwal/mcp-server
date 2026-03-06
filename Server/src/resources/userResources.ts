// Resources in MCP are like data sources that AI models can read from
// They can represent files, database queries, API endpoints, etc.

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"

export function registerUserResources(server: McpServer) {

  // This resource provides access to the complete user dataset
  server.registerResource(
    "users_all",
    "users://all", // URI pattern for this resource
    {
      title: "All Users",
      description: "Get all users",
      mimeType: "application/json", 
    },

    // Resource handler function - called when AI models request this resource
    async (uri) => {
      const users = await import("./users.json", {
        with: { type: "json" }
      }).then(m => m.default)

      return {
        contents: [
          {
            uri: uri.href, // The URI that was requested
            mimeType: "application/json", 
            text: JSON.stringify(users)
          }
        ]
      }
    }
  )

  // This resource uses URI templates to provide access to specific users by ID
  // ResourceTemplate allows for dynamic URI patterns with parameters
  server.registerResource(
    "user_by_id",
    new ResourceTemplate("users://{id}", { list: undefined }), // URI template with {id} parameter
    {
      title: "User Details",
      description: "Get user by ID",
      mimeType: "application/json",
    },
    // Resource handler function - called when AI models request this resource
    // The {id} parameter from the URI template is extracted and passed as the second argument
    async (uri, { id }) => {
      const users = await import("./users.json", {
        with: { type: "json" }
      }).then(m => m.default)
      const user = users.find((u: any) => u.id === Number(id))

      if (!user) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify({ error: "User not found" })
            }
          ]
        }
      }

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(user)
          }
        ]
      }
    }
  )
}