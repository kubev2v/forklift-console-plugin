import { useState } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Stack } from '@patternfly/react-core';
import { getPlanTargetNamespace } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';
import { isProviderLocalOpenshift } from '@utils/resources';

import usePlanDestinationProvider from '../../../hooks/usePlanDestinationProvider';
import type { EditPlanProps } from '../../../SettingsSection/utils/types';

import { onConfirmTargetNamespace } from './utils/utils';
import LocalProviderNamespaceSelect from './LocalProviderNamespaceSelect';
import RemoteProviderNamespaceSelect from './RemoteProviderNamespaceSelect';

const EditPlanTargetNamespace: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();
  const { destinationProvider } = usePlanDestinationProvider(resource);
  const [value, setValue] = useState<string>(getPlanTargetNamespace(resource) ?? '');

  const isLocalProvider = isProviderLocalOpenshift(destinationProvider);

  return (
    <ModalForm
      title={t('Edit migration plan target project')}
      onConfirm={async () => onConfirmTargetNamespace({ newValue: value, resource })}
      {...rest}
    >
      <Stack hasGutter>
        {t(`You can select a migration target project for the migration virtual machines.`)}
        <FormGroupWithHelpText
          label={t('Target project')}
          helperText={t('Please choose a target project for the migrated virtual machines.')}
        >
          {isLocalProvider ? (
            <LocalProviderNamespaceSelect value={value} onChange={setValue} />
          ) : (
            <RemoteProviderNamespaceSelect
              targetProvider={destinationProvider}
              value={value}
              onChange={setValue}
            />
          )}
        </FormGroupWithHelpText>
      </Stack>
    </ModalForm>
  );
};

export default EditPlanTargetNamespace;
