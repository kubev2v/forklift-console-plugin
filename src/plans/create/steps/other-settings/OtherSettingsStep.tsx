import { useWatch } from 'react-hook-form';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Form } from '@patternfly/react-core';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { GeneralFormFieldId } from '../general-information/constants';

import DiskPassPhraseFieldTable from './DiskPassPhraseFieldTable';
import PreserveStaticIpsField from './PreserveStaticIpsField';
import RootDeviceField from './RootDeviceField';
import SharedDisksField from './SharedDisksField';
import TargetPowerStateField from './TargetPowerStateField';
import TransferNetworkField from './TransferNetworkField';

const OtherSettingsStep = () => {
  const { control } = useCreatePlanFormContext();
  const sourceProvider = useWatch({ control, name: GeneralFormFieldId.SourceProvider });
  const isVsphere = sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere;

  return (
    <WizardStepContainer title={planStepNames[PlanWizardStepId.OtherSettings]}>
      <Form>
        {isVsphere && <DiskPassPhraseFieldTable />}

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
