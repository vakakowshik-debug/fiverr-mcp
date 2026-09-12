import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();

app.use(cors());
app.use(express.json());

function createMcpServer() {
  const server = new McpServer({
    name: "fiverr-mcp",
    version: "1.0.0"
  });

  server.tool(
    "test_connection",
    "Test whether the Fiverr MCP server is connected correctly.",
    async () => {
      return {
        content: [
          {
            type: "text",
            text: "Fiverr MCP server is connected successfully!"
          }
        ]
      };
    }
  );

  server.tool(
    "about",
    "Show information about this MCP server.",
    async () => {
      return {
        content: [
          {
            type: "text",
            text: "This is a personal Fiverr MCP server. Fiverr account access has not been connected yet."
          }
        ]
      };
    }
  );

  return server;
}

app.all("/mcp", async (req, res) => {
  const server = createMcpServer();

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  res.on("close", () => {
    transport.close().catch(() => {});
    server.close().catch(() => {});
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal MCP server error"
      });
    }
  }
});

app.get("/", (req, res) => {
  res.send("Fiverr MCP server is running.");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Fiverr MCP server running on port ${PORT}`);
});
