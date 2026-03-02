/**
 * hn_submit_story — Submit a story to HN.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { HNWriteClient } from "../clients/hn-write-client.js";
import { errorResult, jsonResult } from "../types.js";

export function registerSubmitTools(server: McpServer, writeClient: HNWriteClient): void {
  server.tool(
    "hn_submit_story",
    "Submit a new story to HackerNews (requires login). Provide url for a link post, or text for an Ask HN/text post.",
    {
      title: z.string().min(1).max(80).describe("Story title"),
      url: z.string().url().optional().describe("URL for link posts"),
      text: z.string().optional().describe("Text for Ask HN / text posts"),
    },
    async ({ title, url, text }) => {
      if (!url && !text) {
        return errorResult("INVALID_INPUT", "Provide either url or text (or both)");
      }

      try {
        const result = await writeClient.submitStory(title, url, text);
        if (result.success) {
          return jsonResult({ status: "submitted", title });
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
