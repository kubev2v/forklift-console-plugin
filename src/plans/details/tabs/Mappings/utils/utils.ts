import { t } from '@utils/i18n';

type MappingPageMessageProps = {
  loadingResources: boolean;
  resourcesError?: Error | null;
  networkMapsEmpty: boolean;
  storageMapsEmpty: boolean;
};

export const getMappingPageMessage: (props: MappingPageMessageProps) => string | null = ({
  loadingResources,
  networkMapsEmpty,
  resourcesError,
  storageMapsEmpty,
}) => {
  if (loadingResources) {
    return t('Data is loading, please wait.');
  }

  if (networkMapsEmpty || storageMapsEmpty) {
    return t('The mapping data from the inventory is not available, {{resourcesError}}.', {
      resourcesError: resourcesError?.message,
    });
  }

  return null;
};
