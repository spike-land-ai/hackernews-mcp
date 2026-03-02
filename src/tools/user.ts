/**
 * hn_get_user — Fetch HN user profile.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { HNReadClient } from "../clients/hn-read-client.js";
import { errorResult, jsonResult } from "../types.js";

export function registerUserTools(server: McpServer, readClient: HNReadClient): void {
  server.tool(
    "hn_get_user",
    "Get a HackerNews user profile by username",
    { username: z.string().min(1).describe("HN username") },
    async ({ username }) => {
      try {
        const user = await readClient.getUser(username);
        if (!user) {
          return errorResult("NOT_FOUND", `User "${username}" does not exist`);
        }
        return jsonResult(user);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return errorResult("NETWORK_ERROR", message, true);
      }
    },
  );
}
