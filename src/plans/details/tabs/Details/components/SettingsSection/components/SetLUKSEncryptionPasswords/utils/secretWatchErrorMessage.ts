export const getSecretWatchErrorMessage = (secretLoadError: unknown): string | undefined => {
  if (secretLoadError instanceof Error) {
    return secretLoadError.message;
  }

  if (typeof secretLoadError === 'string') {
    return secretLoadError;
  }

  if (
    typeof secretLoadError === 'object' &&
    secretLoadError !== null &&
    'message' in secretLoadError &&
    typeof secretLoadError.message === 'string'
  ) {
    return secretLoadError.message;
  }

  return undefined;
};
