export const mockNavigate = jest.fn();
export const mockCreateProvider = jest.fn();
export const mockCreateProviderSecret = jest.fn();
export const mockPatchProviderSecretOwner = jest.fn();

export const clearAllProviderMocks = () => {
  jest.clearAllMocks();
  mockNavigate.mockClear();
  mockCreateProvider.mockClear();
  mockCreateProviderSecret.mockClear();
  mockPatchProviderSecretOwner.mockClear();
};
