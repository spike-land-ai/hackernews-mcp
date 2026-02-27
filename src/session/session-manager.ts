/**
 * Session Manager — Cookie jar + auth state for HN write operations.
 */

import type { SessionState } from "../types.js";

export class SessionManager {
  private state: SessionState = {
    username: null,
    cookie: null,
    loggedInAt: null,
  };

  isLoggedIn(): boolean {
    return this.state.cookie !== null && this.state.username !== null;
  }

  getUsername(): string | null {
    return this.state.username;
  }

  getCookie(): string | null {
    return this.state.cookie;
  }

  getState(): Readonly<SessionState> {
    return { ...this.state };
  }

  login(username: string, cookie: string): void {
    this.state = {
      username,
      cookie,
      loggedInAt: Date.now(),
    };
  }

  logout(): void {
    this.state = {
      username: null,
      cookie: null,
      loggedInAt: null,
    };
  }
}
