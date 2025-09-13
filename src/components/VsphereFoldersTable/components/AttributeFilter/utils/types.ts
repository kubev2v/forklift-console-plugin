import type { ReactNode } from 'react';

export enum AttributeKind {
  Text = 'text',
  Checkbox = 'Checkbox',
}

type TextAttr<T> = {
  id: string;
  label: string;
  kind: AttributeKind.Text;
  getValue: (item: T) => string | undefined | null;
  match?: (needle: string, haystack: string) => boolean;
};

export type CheckboxOption = { id: string; label?: string; icon?: ReactNode };

export type CheckboxAttr<T> = {
  id: string;
  label: string;
  kind: AttributeKind.Checkbox;
  options: CheckboxOption[];
  getValues: (item: T) => string | string[] | undefined | null;
};

export type AttributeConfig<T> = TextAttr<T> | CheckboxAttr<T>;
