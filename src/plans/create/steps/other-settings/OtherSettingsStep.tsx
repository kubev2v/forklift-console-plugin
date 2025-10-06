import type { FC } from 'react';
import { useWatch } from 'react-hook-form';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Form } from '@patternfly/react-core';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { hasLiveMigrationProviderType } from '../../utils/hasLiveMigrationProviderType';
import { GeneralFormFieldId } from '../general-information/constants';
import { MigrationTypeFieldId, MigrationTypeValue } from '../migration-type/constants';

import { OtherSettingsFormFieldId } from './constants';
import DiskPassPhraseFieldTable from './DiskPassPhraseFieldTable';
import NBDEClevisField from './NBDEClevisField';
import PreserveStaticIpsField from './PreserveStaticIpsField';
import RootDeviceField from './RootDeviceField';
import SharedDisksField from './SharedDisksField';
import TargetPowerStateField from './TargetPowerStateField';
import TransferNetworkField from './TransferNetworkField';

const OtherSettingsStep: FC<{ isLiveMigrationFeatureEnabled: boolean }> = ({
  isLiveMigrationFeatureEnabled,
}) => {
  const { control } = useCreatePlanFormContext();
  const [sourceProvider, nbdeClevis, migrationType] = useWatch({
    control,
    name: [
      GeneralFormFieldId.SourceProvider,
      OtherSettingsFormFieldId.NBDEClevis,
      MigrationTypeFieldId.MigrationType,
    ],
  });
  const isVsphere = sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere;

  const isTransferNetworkVisible =
    !hasLiveMigrationProviderType(sourceProvider) ||
    !isLiveMigrationFeatureEnabled ||
    migrationType !== MigrationTypeValue.Live;

  return (
    <WizardStepContainer title={planStepNames[PlanWizardStepId.OtherSettings]}>
      <Form>
        {isVsphere && (
          <>
            <NBDEClevisField />
            {!nbdeClevis && <DiskPassPhraseFieldTable />}
          </>
        )}

        {isTransferNetworkVisible && <TransferNetworkField />}

        {isVsphere && (
          <>
            <PreserveStaticIpsField />
            <RootDeviceField />
            <SharedDisksField />
          </>
        )}

        <TargetPowerStateField />
      </Form>
    </WizardStepContainer>
  );
};

export default OtherSettingsStep;
