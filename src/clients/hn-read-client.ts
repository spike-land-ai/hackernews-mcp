/**
 * HN Read Client — Firebase API + Algolia search.
 * All methods accept an injected fetch for testability.
 */

import type {
  AlgoliaSearchParams,
  AlgoliaSearchResult,
  FetchFn,
  HNCommentNode,
  HNItem,
  HNItemWithComments,
  HNUpdates,
  HNUser,
  StoryCategory,
} from "../types.js";
import {
  ALGOLIA_BASE,
  HN_FIREBASE_BASE,
  STORY_CATEGORY_ENDPOINTS,
} from "../types.js";

export class HNReadClient {
  private fetchFn: FetchFn;

  constructor(fetchFn: FetchFn = globalThis.fetch) {
    this.fetchFn = fetchFn;
  }

  async getItem(id: number): Promise<HNItem | null> {
    const resp = await this.fetchFn(`${HN_FIREBASE_BASE}/item/${id}.json`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data as HNItem | null;
  }

  async getUser(username: string): Promise<HNUser | null> {
    const resp = await this.fetchFn(
      `${HN_FIREBASE_BASE}/user/${username}.json`,
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return data as HNUser | null;
  }

  async getStoryIds(category: StoryCategory): Promise<number[]> {
    const endpoint = STORY_CATEGORY_ENDPOINTS[category];
    const resp = await this.fetchFn(`${HN_FIREBASE_BASE}/${endpoint}.json`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data as number[]) ?? [];
  }

  async getStories(category: StoryCategory, limit: number): Promise<HNItem[]> {
    const ids = await this.getStoryIds(category);
    const sliced = ids.slice(0, limit);
    const items = await Promise.all(sliced.map(id => this.getItem(id)));
    return items.filter((item): item is HNItem => item !== null);
  }

  async getItemWithComments(
    id: number,
    depth: number,
  ): Promise<HNItemWithComments | null> {
    const item = await this.getItem(id);
    if (!item) return null;

    const comments = await this.buildCommentTree(item.kids ?? [], depth, 1);
    return { ...item, comments };
  }

  private async buildCommentTree(
    kidIds: number[],
    maxDepth: number,
    currentDepth: number,
  ): Promise<HNCommentNode[]> {
    if (currentDepth > maxDepth || kidIds.length === 0) return [];

    const items = await Promise.all(kidIds.map(id => this.getItem(id)));
    const nodes: HNCommentNode[] = [];

    for (const item of items) {
      if (!item) continue;
      const children = currentDepth < maxDepth
        ? await this.buildCommentTree(
          item.kids ?? [],
          maxDepth,
          currentDepth + 1,
        )
        : [];
      nodes.push({
        id: item.id,
        by: item.by,
        time: item.time,
        text: item.text,
        dead: item.dead,
        deleted: item.deleted,
        children,
      });
    }

    return nodes;
  }

  async getUpdates(): Promise<HNUpdates> {
    const resp = await this.fetchFn(`${HN_FIREBASE_BASE}/updates.json`);
    if (!resp.ok) return { items: [], profiles: [] };
    const data = await resp.json();
    return data as HNUpdates;
  }

  async search(params: AlgoliaSearchParams): Promise<AlgoliaSearchResult> {
    const {
      query,
      sortBy = "relevance",
      tags,
      page = 0,
      hitsPerPage = 20,
      numericFilters,
    } = params;
    const endpoint = sortBy === "date" ? "search_by_date" : "search";
    const urlParams = new URLSearchParams({
      query,
      page: String(page),
      hitsPerPage: String(hitsPerPage),
    });
    if (tags) urlParams.set("tags", tags);
    if (numericFilters) urlParams.set("numericFilters", numericFilters);

    const resp = await this.fetchFn(
      `${ALGOLIA_BASE}/${endpoint}?${urlParams.toString()}`,
    );
    if (!resp.ok) {
      return { hits: [], nbHits: 0, page: 0, nbPages: 0, hitsPerPage };
    }
    const data = await resp.json();
    return data as AlgoliaSearchResult;
  }
}
