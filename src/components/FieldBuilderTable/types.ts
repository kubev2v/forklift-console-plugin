import type { ReactElement, ReactNode } from 'react';
import type { FieldArrayPath, FieldArrayWithId, FieldValues } from 'react-hook-form';

export type AddButtonType = {
  isDisabled?: boolean;
  label: ReactNode;
  onClick: () => void;
};

export type RemoveButtonType = {
  isDisabled?: (fieldIndex: number) => boolean;
  onClick: (fieldIndex: number) => void;
  tooltip?: (fieldIndex: number) => string | undefined;
};

export type FieldRow<FormData extends FieldValues> = FieldArrayWithId<
  FormData,
  FieldArrayPath<FormData>
> & {
  additionalOptions?: ReactNode;
  id: string;
  inputs: ReactElement[];
};
