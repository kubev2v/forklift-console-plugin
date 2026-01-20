import type { FC } from 'react';
import { validateURL } from 'src/providers/utils/validators/common';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../constants';
import ProviderFormTextInput from '../ProviderFormTextInput';

const OpenShiftUrlField: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <ProviderFormTextInput
      label={t('API endpoint URL')}
      isRequired={false}
      testId="openshift-url-input"
      fieldId={ProviderFormFieldId.OpenshiftUrl}
      labelHelp={
        <HelpIconPopover header={t('API endpoint URL')}>
          {t('When the URL field is left empty, the local OpenShift cluster is used.')}
        </HelpIconPopover>
      }
      helperText={t('The URL of the API endpoint, for example: https://example.com:6443.')}
      fieldRules={{
        validate: {
          validUrl: async (val: string | undefined) => {
            const trimmedValue = val?.trim() ?? '';

            if (!trimmedValue) {
              return undefined;
            }

            if (!validateURL(trimmedValue)) {
              return t(
                'The URL is invalid. URL should include the schema, for example: https://example.com:6443.',
              );
            }

            return undefined;
          },
        },
      }}
    />
  );
};

export default OpenShiftUrlField;
