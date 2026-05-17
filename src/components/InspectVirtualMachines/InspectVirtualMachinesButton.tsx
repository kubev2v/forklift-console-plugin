import type { FC } from 'react';

import type { V1beta1Plan, V1beta1Provider } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { TOOLTIP_TRIGGER_MANUAL } from '@utils/constants';
import { useForkliftTranslation } from '@utils/i18n';

import InspectVirtualMachinesModal, {
  type InspectVirtualMachinesModalProps,
} from './InspectVirtualMachinesModal';

type InspectVirtualMachinesButtonProps = {
  canInspect: boolean;
  disabledReason: string | undefined;
  plan?: V1beta1Plan;
  provider: V1beta1Provider;
  testId?: string;
};

const InspectVirtualMachinesButton: FC<InspectVirtualMachinesButtonProps> = ({
  canInspect,
  disabledReason,
  plan,
  provider,
  testId = 'plan-inspect-vms-button',
}) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const onClickInspectVms = (): void => {
    launcher<InspectVirtualMachinesModalProps>(InspectVirtualMachinesModal, {
      plan,
      provider,
    });
  };

  return (
    <Tooltip content={disabledReason} trigger={disabledReason ? undefined : TOOLTIP_TRIGGER_MANUAL}>
      <Button
        variant={ButtonVariant.secondary}
        isDisabled={!canInspect}
        onClick={onClickInspectVms}
        data-testid={testId}
      >
        {t('Inspect VMs')}
      </Button>
    </Tooltip>
  );
};

export default InspectVirtualMachinesButton;
