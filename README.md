# @spike-land-ai/hackernews-mcp

Hacker News MCP server for AI browsing. This server provides tools to fetch stories, comments, and user profiles from Hacker News, allowing AI agents to browse and interact with the platform.

## Features

- Fetch top stories, new stories, and best stories.
- Retrieve comments for specific stories.
- Access user profile information.

## Installation

```bash
yarn install
```

## Build

```bash
yarn build
```

## Usage

### Development

```bash
yarn dev
```

### Start Server

```bash
yarn start
```

## Integration

To use this with an MCP client (like Claude Desktop), add it to your configuration:

```json
{
  "mcpServers": {
    "hackernews": {
      "command": "node",
      "args": ["/path/to/packages/hackernews-mcp/dist/index.js"]
    }
  }
}
```
