import { Injectable } from "@angular/core";
import { CanActivate, CanLoad, Router, UrlTree } from "@angular/router";

// Sends logged-out users to the login page before the pages module loads.
// The backend checks every request as well; this stops the panel downloading
// the pages bundle and firing API calls without a valid login.
@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private router: Router) {}

  canLoad(): boolean | UrlTree {
    return this.check();
  }

  canActivate(): boolean | UrlTree {
    return this.check();
  }

  private check(): boolean | UrlTree {
    const token = this.read("accessToken");
    const user = this.read("loginUser");
    if (token && user && !AuthGuard.isExpired(token)) {
      return true;
    }
    localStorage.clear();
    return this.router.parseUrl("/auth/login");
  }

  private read(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      return value && value !== "null" && value !== "undefined" ? value : null;
    } catch (e) {
      return null;
    }
  }

  // Reads the token's expiry without verifying it (the server does that).
  // A token that can't be read counts as expired.
  static isExpired(token: string): boolean {
    try {
      const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(part));
      return !payload.exp || payload.exp * 1000 <= Date.now();
    } catch (e) {
      return true;
    }
  }
}
