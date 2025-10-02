export const isLabelValid = (label: string) => {
  const LABEL_REGEX = /^[a-zA-Z0-9-_./]+=[a-zA-Z0-9-_./]+$/u;
  const LABEL_NO_WHITESPACE_REGEX = /^[^\s]+$/u;
  return LABEL_REGEX.test(label) && LABEL_NO_WHITESPACE_REGEX.test(label);
};
