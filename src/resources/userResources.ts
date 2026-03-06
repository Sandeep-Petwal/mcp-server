import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js"

export function registerUserResources(server: McpServer) {

  server.resource(
    "users_all",
    "users://all",
    {
      title: "All Users",
      description: "Get all users",
      mimeType: "application/json",
    },
    async (uri) => {

      const users = await import("./users.json", {
        with: { type: "json" }
      }).then(m => m.default)

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(users)
          }
        ]
      }
    }
  )

  server.resource(
    "user_by_id",
    new ResourceTemplate("users://{id}", { list: undefined }),
    {
      title: "User Details",
      description: "Get user by ID",
      mimeType: "application/json",
    },
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