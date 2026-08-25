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

const getMonacoEditors = (): MonacoEditor[] => {
  const monacoGlobal = globalThis as MonacoGlobal;
  return monacoGlobal.monaco?.editor?.getEditors?.() ?? [];
};

const getMonacoModels = (): MonacoEditor[] => {
  const monacoGlobal = globalThis as MonacoGlobal;
  return monacoGlobal.monaco?.editor?.getModels?.() ?? [];
};

export const setMonacoEditorValue = ({
  content,
  index = 0,
}: {
  content: string;
  index?: number;
}): boolean => {
  const model = getMonacoModels()[index];
  if (model) {
    model.setValue(content);
    return true;
  }

  const editor = getMonacoEditors()[index];
  if (editor) {
    editor.setValue(content);
    return true;
  }

  return false;
};

export const getMonacoEditorValue = ({ index = 0 }: { index?: number } = {}): string => {
  return getMonacoModels()[index]?.getValue?.() ?? '';
};
