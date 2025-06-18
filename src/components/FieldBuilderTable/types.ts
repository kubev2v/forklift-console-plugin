import type { ReactElement, ReactNode } from 'react';
import type { FieldArrayPath, FieldArrayWithId, FieldValues } from 'react-hook-form';

export type AddButtonType = {
  label: ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
};

export type RemoveButtonType = {
  onClick: (fieldIndex: number) => void;
  isDisabled?: boolean;
};

export type FieldRow<FormData extends FieldValues> = FieldArrayWithId<
  FormData,
  FieldArrayPath<FormData>
> & {
  id: string;
  inputs: ReactElement[];
  additionalOptions?: ReactNode;
};
