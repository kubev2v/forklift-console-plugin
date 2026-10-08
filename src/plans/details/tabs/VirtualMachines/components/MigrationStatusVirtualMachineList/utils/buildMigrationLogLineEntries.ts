type MigrationLogLineEntry = {
  key: string;
  line: string;
};

export const buildMigrationLogLineEntries = (
  logText: string | undefined,
): MigrationLogLineEntry[] => {
  if (!logText) {
    return [];
  }
  const lineOccurrence = new Map<string, number>();
  return logText.split('\n').map((line) => {
    const occurrence = lineOccurrence.get(line) ?? 0;
    lineOccurrence.set(line, occurrence + 1);
    return { key: `${occurrence}::${line}`, line };
  });
};
