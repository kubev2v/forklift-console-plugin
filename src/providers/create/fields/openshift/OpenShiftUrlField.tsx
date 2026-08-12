import type { FC } from 'react';
import { validateURL } from 'src/utils/validation/common';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../constants';
import ProviderFormTextInput from '../ProviderFormTextInput';

const OpenShiftUrlField: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <ProviderFormTextInput
      fieldId={ProviderFormFieldId.OpenshiftUrl}
      fieldRules={{
        validate: {
          validUrl: (val: string | undefined) => {
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
      helperText={t('The URL of the API endpoint, for example: https://example.com:6443.')}
      isRequired={false}
      label={t('API endpoint URL')}
      labelHelp={
        <HelpIconPopover header={t('API endpoint URL')}>
          {t('When the URL field is left empty, the local OpenShift cluster is used.')}
        </HelpIconPopover>
      }
      testId="openshift-url-input"
    />
  );
};

export default OpenShiftUrlField;
