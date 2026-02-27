/**
 * hn_upvote — Upvote a story or comment.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { HNWriteClient } from "../clients/hn-write-client.js";
import { errorResult, jsonResult } from "../types.js";

export function registerVoteTools(
  server: McpServer,
  writeClient: HNWriteClient,
): void {
  server.tool(
    "hn_upvote",
    "Upvote a HackerNews story or comment (requires login)",
    {
      itemId: z.number().int().positive().describe("ID of the item to upvote"),
    },
    async ({ itemId }) => {
      try {
        const result = await writeClient.upvote(itemId);
        if (result.success) {
          return jsonResult({ status: "upvoted", itemId });
        }
        return errorResult(
          result.error,
          result.message,
          result.error === "RATE_LIMITED",
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return errorResult("NETWORK_ERROR", message, true);
      }
    },
  );
}
