import type { FC } from 'react';

import TransferNetworkDetailsItem from '../../../Details/components/SettingsSection/components/PlanTransferNetwork/TransferNetworkDetailsItem';
import PreserveStaticIPsDetailsItem from '../../../Details/components/SettingsSection/components/PreserveStaticIPs/PreserveStaticIPsDetailsItem';
import type { PlanSettingsVisibility } from '../../hooks/usePlanSettingsVisibility';

type PlanSettingsTransferSectionProps = {
  visibility: PlanSettingsVisibility;
};

const PlanSettingsTransferSection: FC<PlanSettingsTransferSectionProps> = ({ visibility }) => {
  const { canPatch, isTransferNetworkVisible, isVsphere, plan } = visibility;

  return (
    <>
      <TransferNetworkDetailsItem
        canPatch={canPatch}
        plan={plan}
        shouldRender={isTransferNetworkVisible}
      />
      <PreserveStaticIPsDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
    </>
  );
};

export default PlanSettingsTransferSection;
