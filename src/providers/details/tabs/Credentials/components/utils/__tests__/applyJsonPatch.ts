export type PatchOperation = { op: string; path: string; value?: unknown };

const getAtPath = (document: unknown, path: string): unknown => {
  let current = document;
  for (const segment of path.split('/').slice(1)) {
    current =
      typeof current === 'object' && current !== null
        ? (current as Record<string, unknown>)[segment]
        : undefined;
  }

  return current;
};

const applyOperation = (document: Record<string, unknown>, operation: PatchOperation): void => {
  if (operation.op === 'test') {
    if (getAtPath(document, operation.path) !== operation.value) {
      throw new Error(`test operation failed for ${operation.path}`);
    }

    return;
  }

  const segments = operation.path.split('/').slice(1);
  const key = segments.pop() ?? '';
  let parent = document;
  for (const segment of segments) {
    parent[segment] ??= {};
    parent = parent[segment] as Record<string, unknown>;
  }

  parent[key] = operation.value;
};

/** Applies the operations the way the API server does: a failed test operation rejects the patch. */
export const applyJsonPatch = <T extends object>(document: T, operations: PatchOperation[]): T => {
  const result = JSON.parse(JSON.stringify(document)) as Record<string, unknown>;
  for (const operation of operations) {
    applyOperation(result, operation);
  }

  return result as T;
};
