import type { ReactElement, ReactNode } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { render, type RenderOptions } from '@testing-library/react';

type RenderWithFormOptions = {
  defaultValues?: Record<string, unknown>;
} & Omit<RenderOptions, 'wrapper'>;

export const renderWithForm = (
  ui: ReactElement,
  { defaultValues = {}, ...renderOptions }: RenderWithFormOptions = {},
): ReturnType<typeof render> => {
  const Wrapper = ({ children }: { children: ReactNode }): ReactElement => {
    const methods = useForm({ defaultValues });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};
