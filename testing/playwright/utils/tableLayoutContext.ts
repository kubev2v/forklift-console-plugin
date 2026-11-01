export type TableLayoutContext = {
  kind?: string;
  theme?: string;
  width?: number;
};

const formatWidth = (width?: number): string | undefined =>
  typeof width === 'number' ? `@ ${width}px` : undefined;

/**
 * Prefixes assertion messages with the table and viewport under test, so a failure
 * reads as "Provider @ 1440px dark: expected a readable table layout" instead of a
 * bare boolean mismatch.
 */
export const formatTableLayoutContext = (context?: TableLayoutContext): string => {
  if (!context) {
    return '';
  }
  const parts = [context.kind, formatWidth(context.width), context.theme].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? `${parts.join(' ')}: ` : '';
};
