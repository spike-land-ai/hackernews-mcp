/**
 * hn_post_comment — Post a comment or reply on HN.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { HNWriteClient } from "../clients/hn-write-client.js";
import { errorResult, jsonResult } from "../types.js";

export function registerCommentTools(server: McpServer, writeClient: HNWriteClient): void {
  server.tool(
    "hn_post_comment",
    "Post a comment or reply on HackerNews (requires login)",
    {
      parentId: z.number().int().positive().describe("ID of the item to reply to"),
      text: z.string().min(1).describe("Comment text"),
    },
    async ({ parentId, text }) => {
      try {
        const result = await writeClient.postComment(parentId, text);
        if (result.success) {
          return jsonResult({ status: "commented", parentId });
        }
        return errorResult(
          result.error,
          result.message,
          result.error === "RATE_LIMITED" || result.error === "CSRF_EXPIRED",
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return errorResult("NETWORK_ERROR", message, true);
      }
    },
  );
}
