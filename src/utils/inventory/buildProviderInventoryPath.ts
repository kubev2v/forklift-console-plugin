const DEFAULT_PROVIDER_DETAIL = 1;

export const buildProviderInventoryPath = (
  providerType: string,
  providerUid: string,
  subPath?: string,
): string => {
  if (subPath) {
    return `providers/${providerType}/${providerUid}/${subPath}`;
  }

  // detail=1 populates derived counts; some provider Get handlers do not force MaxDetail
  return `providers/${providerType}/${providerUid}?detail=${String(DEFAULT_PROVIDER_DETAIL)}`;
};
