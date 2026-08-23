import { isEmpty } from '@utils/helpers';

import { type AttributeConfig, AttributeKind } from '../utils/types';

type TextState = Record<string, string>;
type ChecksState = Record<string, Set<string>>;

export const createAttributeFilterPredicate = <T>(
  attributes: AttributeConfig<T>[],
  text: TextState,
  checks: ChecksState,
) => {
  return (item: T): boolean => {
    for (const attr of attributes) {
      if (attr.kind === AttributeKind.Text) {
        const needle = (text[attr.id] ?? '').trim();
        if (needle) {
          const hay = attr.getValue(item) ?? '';
          const def = (filter: string, data: string): boolean => {
            try {
              return new RegExp(filter, 'iu').test(data);
            } catch {
              return data.toLowerCase().includes(filter.toLowerCase());
            }
          };
          const match = attr.match ?? def;
          if (!match(needle, hay)) {
            return false;
          }
        }
      } else {
        const sel = checks[attr.id];
        if (!isEmpty(sel)) {
          const value = attr.getValues(item);
          let arr: string[] = [];
          if (Array.isArray(value)) {
            arr = value;
          } else if (value) {
            arr = [value];
          }
          if (!arr.some((element) => sel.has(element))) {
            return false;
          }
        }
      }
    }
    return true;
  };
};

export const buildChipsByAttr = <T>(
  attributes: AttributeConfig<T>[],
  text: TextState,
  checks: ChecksState,
): Record<string, string[]> => {
  const out: Record<string, string[]> = {};
  for (const attr of attributes) {
    if (attr.kind === AttributeKind.Text) {
      const value = (text[attr.id] ?? '').trim();
      out[attr.id] = value ? [value] : [];
    } else {
      const sel = checks[attr.id];
      const map = new Map(attr.options.map((option) => [option.id, option.label ?? option.id]));
      out[attr.id] = sel ? Array.from(sel).map((id) => map.get(id) ?? id) : [];
    }
  }
  return out;
};
