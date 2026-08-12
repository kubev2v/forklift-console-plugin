import type { ReactNode } from 'react';

export enum AttributeKind {
  Text = 'text',
  Checkbox = 'Checkbox',
}

type TextAttr<T> = {
  getValue: (item: T) => string | undefined | null;
  id: string;
  kind: AttributeKind.Text;
  label: string;
  match?: (needle: string, haystack: string) => boolean;
};

export type CheckboxOption = { icon?: ReactNode; id: string; label?: string };

export type CheckboxAttr<T> = {
  getValues: (item: T) => string | string[] | undefined | null;
  id: string;
  kind: AttributeKind.Checkbox;
  label: string;
  options: CheckboxOption[];
};

export type AttributeConfig<T> = TextAttr<T> | CheckboxAttr<T>;
