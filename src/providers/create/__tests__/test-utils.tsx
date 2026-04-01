export const mockNavigate = jest.fn();
export const mockCreateProvider = jest.fn();
export const mockCreateProviderSecret = jest.fn();
export const mockPatchProviderSecretOwner = jest.fn();
export const mockSearchParams = new URLSearchParams();

export const clearAllProviderMocks = (): void => {
  jest.clearAllMocks();
  mockNavigate.mockClear();
  mockCreateProvider.mockClear();
  mockCreateProviderSecret.mockClear();
  mockPatchProviderSecretOwner.mockClear();
};

export const mockCreateProviderTypeField = (
  optionValue: string,
  optionLabel: string,
): { __esModule: true; default: () => JSX.Element } => {
  const { useController } = jest.requireActual('react-hook-form');
  const { useCreateProviderFormContext } = jest.requireActual(
    '../hooks/useCreateProviderFormContext',
  );

  const ProviderTypeField = () => {
    const { control } = useCreateProviderFormContext();
    const { field } = useController({ control, name: 'providerType' });

    return (
      <div>
        <label htmlFor="provider-type-select">Provider type</label>
        <select id="provider-type-select" data-testid="provider-type-select" {...field}>
          <option value="">Select a provider type</option>
          <option value={optionValue}>{optionLabel}</option>
        </select>
      </div>
    );
  };

  return { __esModule: true, default: ProviderTypeField };
};
