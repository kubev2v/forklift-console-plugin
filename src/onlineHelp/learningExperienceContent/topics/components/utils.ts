export const getNavigationTarget = (
  href?: string,
  isCreateForm?: boolean,
  url?: string,
): string | undefined => {
  if (href) {
    return href;
  }
  if (isCreateForm) {
    return `${url}/~new`;
  }
  return url;
};
