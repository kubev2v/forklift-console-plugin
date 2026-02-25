import { FormProvider, useForm } from 'react-hook-form';

import { beforeEach, describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CustomScriptsFieldId, CustomScriptsType, DefaultScript } from '../constants';
import CustomScriptsStep from '../CustomScriptsStep';

const mockUseCreatePlanFormContext = jest.fn();
jest.mock('../../../hooks/useCreatePlanFormContext', () => ({
  useCreatePlanFormContext: () => mockUseCreatePlanFormContext(),
}));

jest.mock('../ExistingConfigMapField', () => () => <div data-testid="existing-configmap-field" />);
jest.mock('../NewScriptsFields', () => () => <div data-testid="new-scripts-fields" />);

const TestWrapper = ({
  scriptsType = CustomScriptsType.Existing,
}: {
  scriptsType?: CustomScriptsType;
}) => {
  const methods = useForm({
    defaultValues: {
      [CustomScriptsFieldId.ScriptsType]: scriptsType,
      [CustomScriptsFieldId.ExistingConfigMap]: undefined,
      [CustomScriptsFieldId.Scripts]: [DefaultScript],
    },
  });

  mockUseCreatePlanFormContext.mockReturnValue({
    control: methods.control,
  });

  return (
    <FormProvider {...methods}>
      <CustomScriptsStep />
    </FormProvider>
  );
};

describe('CustomScriptsStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows existing ConfigMap field by default', () => {
    render(<TestWrapper />);

    expect(screen.getByTestId('existing-configmap-field')).toBeInTheDocument();
    expect(screen.queryByTestId('new-scripts-fields')).not.toBeInTheDocument();
  });

  it('shows new scripts fields when "Create new scripts" is selected', () => {
    render(<TestWrapper scriptsType={CustomScriptsType.New} />);

    expect(screen.getByTestId('new-scripts-fields')).toBeInTheDocument();
    expect(screen.queryByTestId('existing-configmap-field')).not.toBeInTheDocument();
  });

  it('toggles from existing to new mode on radio click', async () => {
    const user = userEvent.setup();
    render(<TestWrapper />);

    expect(screen.getByTestId('existing-configmap-field')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /create new scripts/i }));

    expect(screen.getByTestId('new-scripts-fields')).toBeInTheDocument();
    expect(screen.queryByTestId('existing-configmap-field')).not.toBeInTheDocument();
  });

  it('toggles from new back to existing mode on radio click', async () => {
    const user = userEvent.setup();
    render(<TestWrapper scriptsType={CustomScriptsType.New} />);

    expect(screen.getByTestId('new-scripts-fields')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: /use an existing configmap/i }));

    expect(screen.getByTestId('existing-configmap-field')).toBeInTheDocument();
    expect(screen.queryByTestId('new-scripts-fields')).not.toBeInTheDocument();
  });
});
