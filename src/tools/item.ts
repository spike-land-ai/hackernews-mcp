/**
 * hn_get_item, hn_get_item_with_comments — Fetch HN items.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { HNReadClient } from "../clients/hn-read-client.js";
import { errorResult, jsonResult } from "../types.js";

export function registerItemTools(
  server: McpServer,
  readClient: HNReadClient,
): void {
  server.tool(
    "hn_get_item",
    "Get any HackerNews item (story, comment, job, poll) by ID",
    { id: z.number().int().positive().describe("HN item ID") },
    async ({ id }) => {
      try {
        const item = await readClient.getItem(id);
        if (!item) {
          return errorResult("NOT_FOUND", `Item ${id} does not exist`);
        }
        return jsonResult(item);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return errorResult("NETWORK_ERROR", message, true);
      }
    },
  );

  server.tool(
    "hn_get_item_with_comments",
    "Get a HN story/item with its full comment tree",
    {
      id: z.number().int().positive().describe("HN item ID"),
      depth: z.number().int().min(1).max(10).default(3).describe(
        "Max comment nesting depth",
      ),
    },
    async ({ id, depth }) => {
      try {
        const result = await readClient.getItemWithComments(id, depth);
        if (!result) {
          return errorResult("NOT_FOUND", `Item ${id} does not exist`);
        }
        return jsonResult(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return errorResult("NETWORK_ERROR", message, true);
      }
    },
  );
}
