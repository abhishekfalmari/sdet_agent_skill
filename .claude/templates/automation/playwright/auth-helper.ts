import { Page, BrowserContext } from '@playwright/test';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export class AuthHelper {
  private static tokenCache: Map<string, AuthTokens> = new Map();

  static async login(page: Page, credentials: AuthCredentials): Promise<AuthTokens> {
    const cacheKey = credentials.email;
    const cached = this.tokenCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now() + 60000) {
      // Use cached token
      await this.setAuthState(page.context(), cached);
      return cached;
    }

    // Perform login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', credentials.email);
    await page.fill('[data-testid="password-input"]', credentials.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');

    // Extract tokens from localStorage or cookies
    const tokens = await this.extractTokens(page);
    this.tokenCache.set(cacheKey, tokens);

    return tokens;
  }

  static async setAuthState(context: BrowserContext, tokens: AuthTokens) {
    await context.addCookies([{
      name: 'access_token',
      value: tokens.accessToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false
    }]);
  }

  static async extractTokens(page: Page): Promise<AuthTokens> {
    const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'));
    const expiresAt = Date.now() + 3600000; // 1 hour default

    return {
      accessToken: accessToken || '',
      refreshToken: refreshToken || undefined,
      expiresAt
    };
  }

  static async logout(page: Page) {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL('**/login');
    this.tokenCache.clear();
  }
}
