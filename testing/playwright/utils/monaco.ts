type MonacoEditor = {
  getValue?: () => string;
  setValue: (value: string) => void;
};

type MonacoGlobal = typeof globalThis & {
  monaco?: {
    editor?: {
      getEditors?: () => MonacoEditor[];
      getModels?: () => MonacoEditor[];
    };
  };
};

/**
 * These functions are passed to `page.evaluate()` and must be fully self-contained —
 * Playwright serializes only the function body, so nested helpers are not available
 * in the browser context.
 *
 * Prefer editors over models: `editor.setValue` notifies Monaco listeners when present.
 * For CodeEditor/react-hook-form fields prefer `fillMonacoEditorViaKeyboard` instead.
 */
export const setMonacoEditorValue = ({
  content,
  index = 0,
}: {
  content: string;
  index?: number;
}): boolean => {
  const monacoGlobal = globalThis as MonacoGlobal;
  const editors = monacoGlobal.monaco?.editor?.getEditors?.() ?? [];
  const editor = editors[index];
  if (editor) {
    editor.setValue(content);
    return true;
  }

  const models = monacoGlobal.monaco?.editor?.getModels?.() ?? [];
  const model = models[index];
  if (model) {
    model.setValue(content);
    return true;
  }

  return false;
};

export const getMonacoEditorValue = ({ index = 0 }: { index?: number } = {}): string => {
  const monacoGlobal = globalThis as MonacoGlobal;
  const editors = monacoGlobal.monaco?.editor?.getEditors?.() ?? [];
  const editorValue = editors[index]?.getValue?.();
  if (editorValue !== undefined) {
    return editorValue;
  }

  const models = monacoGlobal.monaco?.editor?.getModels?.() ?? [];
  return models[index]?.getValue?.() ?? '';
};
