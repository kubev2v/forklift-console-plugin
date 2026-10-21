type InventoryHttpError = Error & {
  code?: number;
  response?: {
    headers?: { get: (name: string) => string | null };
    status?: number;
  };
};

export const isResourcePoolInventoryEndpointUnavailable = (
  error: Error | null,
  otherInventoriesReady: boolean,
): boolean => {
  if (!error || !otherInventoriesReady) {
    return false;
  }

  const httpError = error as InventoryHttpError;
  const status = httpError.code ?? httpError.response?.status;
  const reason = httpError.response?.headers?.get('X-Reason');

  return status === 404 && reason !== 'ProviderNotFound';
};
