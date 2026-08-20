import { type FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';
import {
  getGroupVersionKindForModel,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { getName } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { toTypedWatchResult } from '@utils/hooks/toTypedWatchResult';
import { useForkliftTranslation } from '@utils/i18n';

import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsSelectInput, { type Option } from '../SettingsSelectInput';

import AapTokenSecretHelpContent from './AapTokenSecretHelpContent';

type EditAapTokenSecretProps = {
  namespace: string;
};

const EditAapTokenSecret: FC<EditAapTokenSecretProps> = ({ namespace }) => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<ForkliftSettingsValues>();

  const [secrets, loaded, loadError] = toTypedWatchResult(
    useK8sWatchResource<IoK8sApiCoreV1Secret[]>({
      groupVersionKind: getGroupVersionKindForModel(SecretModel),
      isList: true,
      namespace,
      namespaced: true,
    }),
  );

  const secretOptions: Option[] = useMemo(() => {
    if (!loaded || loadError || !Array.isArray(secrets) || isEmpty(secrets)) {
      return [];
    }

    return secrets.reduce<Option[]>((acc, secret) => {
      const name = getName(secret) ?? '';
      if (!name) {
        return acc;
      }
      return [...acc, { key: name, name }];
    }, []);
  }, [secrets, loaded, loadError]);

  return (
    <FormGroupWithHelpText
      helperText={t('Select a Secret containing the AAP API Bearer token (key: "token").')}
      label={t('AAP token secret')}
      labelHelp={
        <HelpIconPopover header={t('AAP token secret')}>
          <AapTokenSecretHelpContent />
        </HelpIconPopover>
      }
    >
      <Controller
        control={control}
        name={SettingsFields.AapTokenSecretName}
        render={({ field: { onChange, value } }) => (
          <SettingsSelectInput
            blankOption={{ name: t('None') }}
            isScrollable
            onChange={onChange}
            options={secretOptions}
            testId="aap-token-secret-settings-select"
            value={value ?? ''}
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default EditAapTokenSecret;
