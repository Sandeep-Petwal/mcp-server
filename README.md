## Must read
https://github.com/modelcontextprotocol/typescript-sdk

## View running process
```bash
netstat -ano | findstr 3000
```

## Running the inspector
For stdio
```bash
bun run inspact
```

For http 
```bash
npx @modelcontextprotocol/inspector http://localhost:3000/mcp
```

## OR

## Calling MCP Manually from Terminal

### Get all tool list

```bash
{"jsonrpc":"2.0","id":1,"method":"tools/list"}
```

### Get weather for a city

```bash
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_weather","arguments":{"city":"Delhi"}}}
```

## TOOL

The Model Context Protocol (MCP) allows servers to expose tools that can be invoked by language models. Tools enable models to interact with external systems, such as querying databases, calling APIs, or performing computations. Each tool is uniquely identified by a name and includes metadata describing its schema.

Tool calling (function calling from client)

![Function Calling Diagram](static/images/function-calling-diagram-steps.png)
 

## Resource

The Model Context Protocol (MCP) provides a standardized way for servers to expose resources to clients. Resources allow servers to share data that provides context to language models, such as files, database schemas, or application-specific information. Each resource is uniquely identified by a URI.


## Prompts
The Model Context Protocol (MCP) provides a standardized way for servers to expose prompt templates to clients. Prompts allow servers to provide structured messages and instructions for interacting with language models. Clients can discover available prompts, retrieve their contents, and provide arguments to customize them.




# Complete MCP Guide 
