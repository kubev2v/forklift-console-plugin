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
};
