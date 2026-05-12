import type { Page } from '@playwright/test';

import { V2_11_0 } from '../../utils/version/constants';
import { isVersionAtLeast } from '../../utils/version/version';

export const selectProviderProject = async (page: Page, projectName: string): Promise<void> => {
  if (!isVersionAtLeast(V2_11_0)) {
    const projectSelect = page.getByTestId('target-project-select');
    await projectSelect.waitFor({ state: 'visible', timeout: 10000 });
    await projectSelect.getByRole('button').click();
    await projectSelect.getByRole('combobox').fill(projectName);
    const option = page.getByRole('option', { name: projectName });
    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
    return;
  }

  const projectSelect = page.getByTestId('provider-project-select');
  await projectSelect.waitFor({ state: 'visible', timeout: 10000 });
  const textInput = projectSelect.locator('input');
  const currentValue = await textInput.inputValue();
  if (currentValue === projectName) return;
  await textInput.click();
  await textInput.clear();
  await textInput.fill(projectName);
  const option = page.getByRole('option', { name: projectName, exact: true });
  await option.waitFor({ state: 'visible', timeout: 10000 });
  await option.click();
};
