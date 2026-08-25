import { expect, type Page } from '@playwright/test';

const MONACO_EDITOR_SELECTOR = '.code-editor-container .monaco-editor';
const MONACO_READY_TIMEOUT_MS = 30_000;

/**
 * SdkYamlEditor / CodeEditor only update react-hook-form through onChange.
 * Programmatic Monaco setValue skips that path — type via the keyboard instead.
 */
export const fillMonacoEditorViaKeyboard = async (
  page: Page,
  content: string,
  editorIndex = 0,
): Promise<void> => {
  const editor = page.locator(MONACO_EDITOR_SELECTOR).nth(editorIndex);
  await expect(editor).toBeVisible({ timeout: MONACO_READY_TIMEOUT_MS });
  await editor.click();
  const selectAll = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';
  await page.keyboard.press(selectAll);
  await page.keyboard.insertText(content);
};
