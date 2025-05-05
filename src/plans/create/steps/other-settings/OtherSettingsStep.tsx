import { useWatch } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Form } from '@patternfly/react-core';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks';
import { ProviderType } from '../../types';
import { GeneralFormFieldId } from '../general-information/constants';

import DiskPassPhraseFieldTable from './DiskPassPhraseFieldTable';
import PreserveStaticIpsField from './PreserveStaticIpsField';
import RootDeviceField from './RootDeviceField';
import SharedDisksField from './SharedDisksField';
import TransferNetworkField from './TransferNetworkField';

const OtherSettingsStep = () => {
  const { control } = useCreatePlanFormContext();
  const sourceProvider = useWatch({ control, name: GeneralFormFieldId.SourceProvider });
  const isVsphere = sourceProvider?.spec?.type === ProviderType.Vsphere;

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
      </Form>
    </WizardStepContainer>
  );
};

export default OtherSettingsStep;
