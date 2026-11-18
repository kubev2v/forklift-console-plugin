import type { ReactElement } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import DiskPassPhraseFieldTable from '../DiskPassPhraseFieldTable';

const mockUseCreatePlanFormContext = jest.fn();
jest.mock('../../../hooks/useCreatePlanFormContext', () => ({
  useCreatePlanFormContext: (): ReturnType<typeof mockUseCreatePlanFormContext> =>
    mockUseCreatePlanFormContext(),
}));

const TestWrapper = (): ReactElement => {
  const methods = useForm();
  mockUseCreatePlanFormContext.mockReturnValue({
    control: methods.control,
    setValue: methods.setValue,
  });

  return (
    <FormProvider {...methods}>
      <DiskPassPhraseFieldTable />
    </FormProvider>
  );
};

describe('DiskPassPhraseFieldTable', () => {
  it('mentions BitLocker in the passphrase help', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);

    const [helpButton] = screen.getAllByRole('button');
    await user.click(helpButton);

    expect(screen.getByText(/LUKS- or BitLocker-encrypted devices/)).toBeInTheDocument();
    expect(screen.getByText(/For each LUKS- or BitLocker-encrypted device/)).toBeInTheDocument();
  });
});
