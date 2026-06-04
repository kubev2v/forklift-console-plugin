import type { Page } from '@playwright/test';

/**
 * Post-login console routes (default landing pages vary by cluster/version).
 * Anchored to the path portion (^[^?#]*) so OAuth query params containing
 * "console" or similar words cannot trigger a false-positive success match.
 */
const POST_LOGIN_URL_PATTERN =
  /^[^?#]*\/(?:dashboards|console|k8s|overview|monitoring|topology|dev-console)(?:\/|$)/;

const OAUTH_ACCESS_DENIED_PATTERN = /reason=access_denied/;

const LOGIN_ERROR_TEXT = /invalid login or password/i;

export class LoginPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async login(baseURL: string, username: string, password?: string): Promise<void> {
    await this.page.goto(baseURL);
    await this.page.waitForSelector('#co-login-form', { timeout: 30000 });
    await this.page.fill('#inputUsername', username);

    if (password) {
      await this.page.fill('#inputPassword', password);
    }

    await this.page.waitForFunction(
      () => {
        const button = document.querySelector('#co-login-button')!;
        return button && !(button as HTMLButtonElement).disabled;
      },
      { timeout: 10000 },
    );
    await this.page.click('#co-login-button');

    const loginError = this.page.getByText(LOGIN_ERROR_TEXT);

    const outcome = await Promise.race([
      this.page
        .waitForURL(POST_LOGIN_URL_PATTERN, { timeout: 30000 })
        .then(() => 'success' as const),
      this.page
        .waitForURL(OAUTH_ACCESS_DENIED_PATTERN, { timeout: 30000 })
        .then(() => 'access_denied' as const),
      loginError
        .waitFor({ state: 'visible', timeout: 30000 })
        .then(() => 'invalid_credentials' as const),
    ]).catch(async () => {
      const url = this.page.url();
      const hasLoginError = await loginError.isVisible().catch(() => false);
      const loginFormVisible = await this.page
        .locator('#co-login-form')
        .isVisible()
        .catch(() => false);

      throw new Error(
        [
          `Login timed out waiting for console redirect (30s).`,
          `URL: ${url}`,
          loginFormVisible
            ? 'Login form is still visible — credentials may be wrong or OAuth flow blocked.'
            : '',
          hasLoginError ? 'Page shows: "Invalid login or password."' : '',
          `Expected URL to match: ${POST_LOGIN_URL_PATTERN}`,
        ]
          .filter(Boolean)
          .join(' '),
      );
    });

    if (outcome === 'access_denied') {
      throw new Error(
        `Login failed: OAuth access denied for user "${username}". URL: ${this.page.url()}`,
      );
    }

    if (outcome === 'invalid_credentials') {
      throw new Error(
        `Login failed: invalid credentials for user "${username}". URL: ${this.page.url()}`,
      );
    }
  }
}
