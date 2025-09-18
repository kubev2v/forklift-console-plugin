import { type Dispatch, type SetStateAction, useCallback, useMemo, useState } from 'react';

import { isEmpty } from '@utils/helpers';

import { type AttributeConfig, AttributeKind } from '../utils/types';

type TextState = Record<string, string>;
type ChecksState = Record<string, Set<string>>;

export type AttributeFilters<T> = {
  activeId: string;
  checks: ChecksState;
  chipsByAttr: Record<string, string[]>;
  clearAll: () => void;
  clearChecks: (id: string) => void;
  clearText: (id: string) => void;
  deleteChip: (attrId: string, chipLabel: string) => void;
  deleteChipGroup: (attrId: string) => void;
  hasAttrFilters: boolean;
  predicate: (item: T) => boolean;
  setActiveId: Dispatch<SetStateAction<string>>;
  setTextValue: (id: string, value: string) => void;
  text: TextState;
  toggleCheck: (id: string, opt: string) => void;
};

export const useAttributeFilters = <T>(attributes: AttributeConfig<T>[]): AttributeFilters<T> => {
  const [activeId, setActiveId] = useState(attributes[0]?.id ?? '');
  const [text, setText] = useState<TextState>({});
  const [checks, setChecks] = useState<ChecksState>({});

  const setTextValue = useCallback((id: string, value: string) => {
    setText((filters) => ({ ...filters, [id]: value }));
  }, []);
  const clearText = useCallback((id: string) => {
    setText((filters) => ({ ...filters, [id]: '' }));
  }, []);

  const toggleCheck = useCallback((id: string, opt: string) => {
    setChecks((filters) => {
      const next = new Set(filters[id] ?? []);
      if (next.has(opt)) {
        next.delete(opt);
      } else {
        next.add(opt);
      }
      return { ...filters, [id]: next };
    });
  }, []);
  const clearChecks = useCallback((id: string) => {
    setChecks((filters) => ({ ...filters, [id]: new Set() }));
  }, []);
  const clearAll = useCallback(() => {
    setText({});
    setChecks({});
    setActiveId(attributes[0]?.id ?? '');
  }, [attributes]);

  const predicate = useCallback(
    (item: T) => {
      for (const attr of attributes) {
        if (attr.kind === AttributeKind.Text) {
          const needle = (text[attr.id] ?? '').trim();
          if (needle) {
            const hay = (attr.getValue(item) ?? '').toString();
            const def = (filter: string, data: string) => {
              try {
                return new RegExp(filter, 'iu').test(data);
              } catch {
                return data.toLowerCase().includes(filter.toLowerCase());
              }
            };
            const match = attr.match ?? def;
            if (!match(needle, hay)) return false;
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
            if (!arr.some((element) => sel.has(element))) return false;
          }
        }
      }
      return true;
    },
    [attributes, text, checks],
  );

  const chipsByAttr: Record<string, string[]> = useMemo(() => {
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
  }, [attributes, text, checks]);

  const hasAttrFilters = useMemo(() => !isEmpty(text) || !isEmpty(checks), [text, checks]);

  const deleteChip = useCallback(
    (attrId: string, chipLabel: string) => {
      const attr = attributes.find((attribute) => attribute.id === attrId);
      if (!attr) return;
      if (attr.kind === AttributeKind.Text) {
        clearText(attrId);
        return;
      }
      const opt = attr.options.find((option) => (option.label ?? option.id) === chipLabel);
      if (opt) toggleCheck(attrId, opt.id);
    },
    [attributes, clearText, toggleCheck],
  );

  const deleteChipGroup = useCallback(
    (attrId: string) => {
      const attr = attributes.find((attribute) => attribute.id === attrId);
      if (!attr) return;
      if (attr.kind === AttributeKind.Text) {
        clearText(attrId);
        return;
      }
      clearChecks(attrId);
    },
    [attributes, clearText, clearChecks],
  );

  return {
    activeId,
    checks,
    chipsByAttr,
    clearAll,
    clearChecks,
    clearText,
    deleteChip,
    deleteChipGroup,
    hasAttrFilters,
    predicate,
    setActiveId,
    setTextValue,
    text,
    toggleCheck,
  };
};
