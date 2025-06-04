import { type FC, useState } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import { Stack } from '@patternfly/react-core';
import { getPlanTargetNamespace } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import usePlanDestinationProvider from '../../../hooks/usePlanDestinationProvider';
import type { EditPlanProps } from '../../../SettingsSection/utils/types';

import { onConfirmTargetNamespace } from './utils/utils';
import TargetNamespaceSelect from './TargetNamespaceSelect';

const EditPlanTargetNamespace: FC<EditPlanProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();
  const { destinationProvider } = usePlanDestinationProvider(resource);
  const [value, setValue] = useState<string>(getPlanTargetNamespace(resource) ?? '');

  return (
    <ModalForm
      title={t('Edit migration plan target project')}
      onConfirm={async () => onConfirmTargetNamespace({ newValue: value, resource })}
    >
      <Stack hasGutter>
        {t(`You can select a migration target project for the migration virtual machines.`)}
        <FormGroupWithHelpText
          label={t('Target project')}
          helperText={t('Please choose a target project for the migrated virtual machines.')}
        >
          <TargetNamespaceSelect provider={destinationProvider} value={value} onChange={setValue} />
        </FormGroupWithHelpText>
      </Stack>
    </ModalForm>
  );
};

export default EditPlanTargetNamespace;
