const HIGHLIGHT_SUBSTRINGS = [
  'virt-v2v: error',
  'level=error',
  'Failed to execute',
  'VixDiskLib_Open',
  'Error executing',
  'vddk[1]: error',
];

export const isMigrationLogLineHighlighted = (line: string): boolean => {
  const lowerLine = line.toLowerCase();
  return HIGHLIGHT_SUBSTRINGS.some((fragment) => lowerLine.includes(fragment.toLowerCase()));
};
