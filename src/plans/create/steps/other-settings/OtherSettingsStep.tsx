import { useWatch } from 'react-hook-form';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Form } from '@patternfly/react-core';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { GeneralFormFieldId } from '../general-information/constants';

import { OtherSettingsFormFieldId } from './constants';
import DiskPassPhraseFieldTable from './DiskPassPhraseFieldTable';
import NBDEClevisField from './NBDEClevisField';
import PreserveStaticIpsField from './PreserveStaticIpsField';
import RootDeviceField from './RootDeviceField';
import SharedDisksField from './SharedDisksField';
import TargetPowerStateField from './TargetPowerStateField';
import TransferNetworkField from './TransferNetworkField';

const OtherSettingsStep = () => {
  const { control } = useCreatePlanFormContext();
  const [sourceProvider, nbdeClevis] = useWatch({
    control,
    name: [GeneralFormFieldId.SourceProvider, OtherSettingsFormFieldId.NBDEClevis],
  });
  const isVsphere = sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere;

  return (
    <WizardStepContainer title={planStepNames[PlanWizardStepId.OtherSettings]}>
      <Form>
        {isVsphere && (
          <>
            <NBDEClevisField />
            {!nbdeClevis && <DiskPassPhraseFieldTable />}
          </>
        )}

        <TransferNetworkField />

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
