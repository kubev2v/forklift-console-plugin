import type { Page } from '@playwright/test';

import { GUEST_TYPE_LABELS, SCRIPT_TYPE_LABELS, type ScriptConfig } from '../types/test-data';

type ScriptFieldTestIds = {
  guestTypeSelect: (index: number) => string;
  nameInput: (index: number) => string;
  scriptTypeSelect: (index: number) => string;
};

const setMonacoEditorContent = async (
  page: Page,
  index: number,
  content: string,
): Promise<void> => {
  const success = await page.evaluate(
    ({ idx, scriptContent }) => {
      const editors = (globalThis as any).monaco?.editor?.getEditors?.();
      if (editors && Array.isArray(editors) && editors.length > idx) {
        editors[idx].setValue(scriptContent);
        return true;
      }
      return false;
    },
    { idx: index, scriptContent: content },
  );

  if (!success) {
    throw new Error(`Failed to set script content at index ${index} - Monaco editor not found`);
  }
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
    await setMonacoEditorContent(page, index, config.content);
  }
};
