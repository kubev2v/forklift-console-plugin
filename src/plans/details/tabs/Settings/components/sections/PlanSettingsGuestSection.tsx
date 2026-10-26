import type { FC } from 'react';

import GuestConversionDetailsItem from '../../../Details/components/SettingsSection/components/GuestConversion/GuestConversionDetailsItem';
import SharedDisksDetailsItem from '../../../Details/components/SettingsSection/components/PlanMigrateSharedDisks/MigrateSharedDisksDetailsItem';
import PreserveClusterCpuModelDetailsItem from '../../../Details/components/SettingsSection/components/PreserveClusterCpuModel/PreserveClusterCpuModelDetailsItem';
import RootDiskDetailsItem from '../../../Details/components/SettingsSection/components/RootDisk/RootDiskDetailsItem';
import SetLUKSEncryptionPasswordsDetailsItem from '../../../Details/components/SettingsSection/components/SetLUKSEncryptionPasswords/SetLUKSEncryptionPasswordsDetailsItem';
import XfsCompatibilityDetailsItem from '../../../Details/components/SettingsSection/components/XfsCompatibility/XfsCompatibilityDetailsItem';
import type { PlanSettingsVisibility } from '../../hooks/usePlanSettingsVisibility';

type PlanSettingsGuestSectionProps = {
  visibility: PlanSettingsVisibility;
};

const PlanSettingsGuestSection: FC<PlanSettingsGuestSectionProps> = ({ visibility }) => {
  const { canPatch, isOvirt, isVddkInitImageNotSet, isVsphere, plan } = visibility;

  return (
    <>
      <SetLUKSEncryptionPasswordsDetailsItem
        canPatch={canPatch}
        plan={plan}
        shouldRender={isVsphere}
      />
      <RootDiskDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <SharedDisksDetailsItem
        canPatch={canPatch}
        isVddkInitImageNotSet={isVddkInitImageNotSet}
        plan={plan}
        shouldRender={isVsphere}
      />
      <XfsCompatibilityDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <GuestConversionDetailsItem canPatch={canPatch} plan={plan} shouldRender={isVsphere} />
      <PreserveClusterCpuModelDetailsItem canPatch={canPatch} plan={plan} shouldRender={isOvirt} />
    </>
  );
};

export default PlanSettingsGuestSection;
