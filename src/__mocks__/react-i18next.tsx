import { Children, type ElementType, isValidElement, type ReactNode } from 'react';
/**
 * Mock translation utility
 *
 * @returns {{ t: (k: string) => string; }}
 */
export const useTranslation = (): {
  i18n: { resolvedLanguage: string };
  t: (key: string) => string;
} => ({
  i18n: {
    resolvedLanguage: 'en',
  },
  t: (key: string): string => key,
});

export const getI18n = (): { t: (key: string) => string } => ({
  t: (key: string): string => key,
});

const flattenTransChildren = (children: unknown): ReactNode =>
  Children.toArray(
    (Array.isArray(children) ? children : [children]).map((child: unknown): ReactNode => {
      if (isValidElement(child)) {
        const { children: nested, ...rest } = child.props as { children?: unknown };
        if (nested === undefined) {
          return child;
        }
        const Element = child.type as ElementType;
        return <Element {...rest}>{flattenTransChildren(nested)}</Element>;
      }
      if (child && typeof child === 'object') {
        return String(Object.values(child)[0] ?? '');
      }
      return child as ReactNode;
    }),
  );

export const Trans = ({ children }: { children?: ReactNode }): ReactNode =>
  flattenTransChildren(children);
