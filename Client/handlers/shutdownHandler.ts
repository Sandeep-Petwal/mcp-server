import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export class ShutdownHandler {
    constructor(
        private client: Client,
        private transport: StreamableHTTPClientTransport
    ) {}

    // graceful shutdown function
    async gracefulShutdown() {
        try {
            console.log("Closing MCP client connection...");

            if (this.client) {
                await this.client.close();
                console.log("MCP client closed successfully.");
            }

            if (this.transport) {
                await this.transport.close();
                console.log("Transport closed successfully.");
            }

            console.log("Graceful shutdown completed.");
            process.exit(0);
        } catch (error) {
            console.error("Error during graceful shutdown:", error);
            process.exit(1);
        }
    }

    // Initialize all process signal handlers
    initializeHandlers() {
        // Handle process signals for graceful shutdown
        process.on('SIGINT', async () => {
            console.log("\nReceived SIGINT (Ctrl+C). Initiating graceful shutdown...");
            await this.gracefulShutdown();
        });

        process.on('SIGTERM', async () => {
            console.log("\nReceived SIGTERM. Initiating graceful shutdown...");
            await this.gracefulShutdown();
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', async (error) => {
            console.error("Uncaught Exception:", error);
            await this.gracefulShutdown();
        });

        process.on('unhandledRejection', async (reason, promise) => {
            // Ignore ExitPromptError from inquirer prompts (this is expected when user presses Ctrl+C)
            if (reason instanceof Error && reason.name === 'ExitPromptError') {
                console.log("\nUser interrupted the prompt. Shutting down gracefully...");
                await this.gracefulShutdown();
                return;
            }

            console.error("Unhandled Rejection at:", promise, "reason:", reason);
            await this.gracefulShutdown();
        });
    }
}
