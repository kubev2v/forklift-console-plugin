import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import { NetworkMapFieldId, type NetworkMapping } from '../../constants';

export const validateNetworkMaps = (mappings: NetworkMapping[]): string | undefined => {
  if (isEmpty(mappings)) {
    return t('At least one network mapping is required.');
  }

  const mappingErrors = mappings
    .map((mapping, index) => {
      const errors: string[] = [];

      if (!mapping[NetworkMapFieldId.SourceNetwork]?.name) {
        errors.push(t('Source network is required for mapping {{index}}.', { index: index + 1 }));
      }

      if (!mapping[NetworkMapFieldId.TargetNetwork]?.name) {
        errors.push(t('Target network is required for mapping {{index}}.', { index: index + 1 }));
      }

      return errors;
    })
    .flat();

  if (!isEmpty(mappingErrors)) {
    return mappingErrors.join(' ');
  }

  return undefined;
};
