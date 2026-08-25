import type { Page } from '@playwright/test';

import { GUEST_TYPE_LABELS, SCRIPT_TYPE_LABELS, type ScriptConfig } from '../types/test-data';

import { fillMonacoEditorViaKeyboard } from './fillMonacoEditorViaKeyboard';

type ScriptFieldTestIds = {
  guestTypeSelect: (index: number) => string;
  nameInput: (index: number) => string;
  scriptTypeSelect: (index: number) => string;
};

export const fillScriptFields = async (
  page: Page,
  index: number,
  config: ScriptConfig,
  testIds: ScriptFieldTestIds,
): Promise<void> => {
  const nameInput = page.getByTestId(testIds.nameInput(index));
  await nameInput.clear();
  await nameInput.fill(config.name);

  if (config.guestType) {
    const select = page.getByTestId(testIds.guestTypeSelect(index));
    await select.click();
    await page.getByRole('option', { name: GUEST_TYPE_LABELS[config.guestType] }).click();
  }

  if (config.scriptType) {
    const select = page.getByTestId(testIds.scriptTypeSelect(index));
    await select.click();
    await page.getByRole('option', { name: SCRIPT_TYPE_LABELS[config.scriptType] }).click();
  }

  if (config.content) {
    await fillMonacoEditorViaKeyboard(page, config.content, index);
  }
};
