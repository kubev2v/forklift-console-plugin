import type { Page } from '@playwright/test';

/** Console routes use path-based or hash-based URLs depending on cluster / dev mode. */
const CONSOLE_ROUTE_PATTERN =
  /(?:^|[#/])(?:dashboards|console|k8s|overview|monitoring|topology|dev-console)(?:\/|$|[?#])/u;

const OAUTH_ACCESS_DENIED_PATTERN = /reason=access_denied/u;

const LOGIN_ERROR_TEXT = /invalid login or password/iu;

const GLOBAL_SETUP_LOGIN_TIMEOUT_MS = 90_000;

const CONSOLE_SHELL = '#co-main-layout, #ocs-main-container, [data-test-id="perspective-switcher"]';

const isVisibleOrFalse = async (getVisibility: () => Promise<boolean>): Promise<boolean> => {
  try {
    return await getVisibility();
  } catch {
    return false;
  }
};

export const isConsoleRouteUrl = (urlString: string): boolean => {
  try {
    const { hash, pathname } = new URL(urlString);
    return CONSOLE_ROUTE_PATTERN.test(pathname) || CONSOLE_ROUTE_PATTERN.test(hash);
  } catch {
    return false;
  }
};

export class LoginPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async getConsoleLoadError(baseURL: string, cause: unknown): Promise<Error> {
    const url = this.page.url();
    const bodyText =
      (await this.page
        .locator('body')
        .innerText()
        .catch(() => '')) ?? '';
    const isBlank = bodyText.trim().length === 0;

    const hints = [
      isBlank
        ? `No UI loaded at ${url}. Start the console with "npm run console" (or open ${baseURL}) and wait until it is ready.`
        : `Console at ${url} did not show the login form or main shell within ${GLOBAL_SETUP_LOGIN_TIMEOUT_MS}ms.`,
      'For OAuth clusters use "npm run console -- --auth" and valid CLUSTER_USERNAME / CLUSTER_PASSWORD.',
      'To refresh a stale session, delete testing/playwright/.auth/user.json or set PLAYWRIGHT_FORCE_LOGIN=1.',
    ];

    const causeMessage = cause instanceof Error ? cause.message : String(cause);
    return new Error(`${hints.join(' ')} (${causeMessage})`);
  }

  private async waitForLoginFormOrConsole(): Promise<'authenticated' | 'login-form'> {
    const loginForm = this.page.locator('#co-login-form');
    const consoleShell = this.page.locator(CONSOLE_SHELL).first();

    return Promise.any([
      loginForm
        .waitFor({ state: 'visible', timeout: GLOBAL_SETUP_LOGIN_TIMEOUT_MS })
        .then(() => 'login-form' as const),
      this.page
        .waitForURL((url) => isConsoleRouteUrl(url.toString()), {
          timeout: GLOBAL_SETUP_LOGIN_TIMEOUT_MS,
        })
        .then(() => 'authenticated' as const),
      consoleShell
        .waitFor({ state: 'visible', timeout: GLOBAL_SETUP_LOGIN_TIMEOUT_MS })
        .then(() => 'authenticated' as const),
    ]);
  }

  async login(baseURL: string, username: string, password?: string): Promise<void> {
    await this.page.goto(baseURL, {
      timeout: GLOBAL_SETUP_LOGIN_TIMEOUT_MS,
      waitUntil: 'domcontentloaded',
    });
    let state: 'authenticated' | 'login-form';
    try {
      state = await this.waitForLoginFormOrConsole();
    } catch (error) {
      throw await this.getConsoleLoadError(baseURL, error);
    }

    if (state === 'authenticated') {
      return;
    }

    const loginForm = this.page.locator('#co-login-form');
    await loginForm.waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.fill('#inputUsername', username);

    if (password) {
      await this.page.fill('#inputPassword', password);
    }

    await this.page.waitForFunction(
      () => {
        const button = document.querySelector('#co-login-button');
        return button && !(button as HTMLButtonElement).disabled;
      },
      { timeout: 10_000 },
    );
    await this.page.click('#co-login-button');

    const loginError = this.page.getByText(LOGIN_ERROR_TEXT);

    const outcome = await Promise.any([
      this.page
        .waitForURL((url) => isConsoleRouteUrl(url.toString()), { timeout: 60_000 })
        .then(() => 'success' as const),
      this.page
        .waitForURL(OAUTH_ACCESS_DENIED_PATTERN, { timeout: 60_000 })
        .then(() => 'access_denied' as const),
      loginError
        .waitFor({ state: 'visible', timeout: 60_000 })
        .then(() => 'invalid_credentials' as const),
      this.page
        .locator(CONSOLE_SHELL)
        .first()
        .waitFor({ state: 'visible', timeout: 60_000 })
        .then(() => 'success' as const),
    ]).catch(async () => {
      const currentUrl = this.page.url();
      const hasLoginError = await isVisibleOrFalse(() => loginError.isVisible());
      const loginFormVisible = await isVisibleOrFalse(() =>
        this.page.locator('#co-login-form').isVisible(),
      );

      throw new Error(
        [
          'Login timed out waiting for console redirect (60s).',
          `URL: ${currentUrl}`,
          loginFormVisible
            ? 'Login form is still visible — credentials may be wrong or OAuth flow blocked.'
            : '',
          hasLoginError ? 'Page shows: "Invalid login or password."' : '',
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
