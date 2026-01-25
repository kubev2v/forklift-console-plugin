import { type FC, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import type { V1NetworkAttachmentDefinition } from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { type ForkliftSettingsValues, SettingsFields } from '../../utils/types';
import SettingsSelectInput, { type Option } from '../SettingsSelectInput';

import ControllerTransferNetworkHelpContent from './ControllerTransferNetworkHelpContent';

const EditControllerTransferNetwork: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext<ForkliftSettingsValues>();

  const [nads, loaded, loadError] = useK8sWatchResource<V1NetworkAttachmentDefinition[]>({
    groupVersionKind: {
      group: 'k8s.cni.cncf.io',
      kind: 'NetworkAttachmentDefinition',
      version: 'v1',
    },
    isList: true,
  });

  const controllerTransferNetworkOptions = useMemo(() => {
    if (!loaded || loadError) return [];

    if (!Array.isArray(nads) || isEmpty(nads)) return [];

    return nads.reduce<Option[]>((acc, nad) => {
      const name = getName(nad) ?? '';
      const namespace = getNamespace(nad) ?? '';
      const key = `${namespace}/${name}`;
      if (!name || !namespace) return acc;
      return [
        ...acc,
        {
          description: namespace,
          key,
          name,
        },
      ];
    }, []);
  }, [nads, loaded, loadError]);

  return (
    <FormGroupWithHelpText
      label={t('Controller transfer network')}
      labelHelp={
        <HelpIconPopover header={t('Controller transfer network')}>
          <ControllerTransferNetworkHelpContent />
        </HelpIconPopover>
      }
      helperText={t('Please choose a NetworkAttachmentDefinition for data transfer.')}
    >
      <Controller
        control={control}
        name={SettingsFields.ControllerTransferNetwork}
        render={({ field: { onChange, value } }) => (
          <SettingsSelectInput
            onChange={onChange}
            value={String(value)}
            options={controllerTransferNetworkOptions}
            showKeyAsSelected
            blankOption={{
              name: t('None'),
            }}
            testId="controller-transfer-network-select"
          />
        )}
      />
    </FormGroupWithHelpText>
  );
};

export default EditControllerTransferNetwork;
