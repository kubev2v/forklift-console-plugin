import type { Page } from '@playwright/test';

import { V2_11_0 } from '../../utils/version/constants';
import { isVersionAtLeast } from '../../utils/version/version';

export const skipProviderCertificateValidation = async (page: Page): Promise<void> => {
  if (!isVersionAtLeast(V2_11_0)) {
    await page
      .getByRole('checkbox', { name: /Skip certificate validation/i })
      .check({ force: true });
    return;
  }

  await page.getByTestId('certificate-validation-skip').click();

  // MTV 5.0+ opens a confirm modal; without accepting it the form stays on
  // Configure (empty CA) and Create provider remains disabled.
  const confirmSkip = page.getByTestId('confirm-skip-certificate-validation');
  if (await confirmSkip.isVisible({ timeout: 5000 }).catch(() => false)) {
    await confirmSkip.click();
  }
};
