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
            if (this.client) {
                await this.client.close();
            }

            if (this.transport) {
                await this.transport.close();
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
            await this.gracefulShutdown();
        });

        process.on('SIGTERM', async () => {
            await this.gracefulShutdown();
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', async (error) => {
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
