import type { FC } from 'react';
import { PageHeadings } from 'src/components/DetailPageHeadings/PageHeadings';
import InspectVirtualMachinesModal, {
  type InspectVirtualMachinesModalProps,
} from 'src/components/InspectVirtualMachines/InspectVirtualMachinesModal';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import ProviderActionsDropdown from 'src/providers/actions/ProviderActionsDropdown';
import type { ProviderData } from 'src/providers/utils/types/ProviderData';
import useGetDeleteAndEditAccessReview from 'src/utils/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/utils/hooks/useProviderInventory';

import { type ProviderInventory, ProviderModel } from '@forklift-ui/types';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Flex, FlexItem, Tooltip } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import CreatePlanAction from './components/CreatePlanAction';
import ProviderPageHeaderAlerts from './components/ProviderPageHeaderAlerts';
import { useCanInspectProvider } from './hooks/useCanInspectProvider';
import { useProvider } from './hooks/useProvider';
import type { ProviderDetailsPageProps } from './utils/types';

const ProviderPageHeader: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { provider } = useProvider(name, namespace);
  const { t } = useForkliftTranslation();
  const launcher = useModal();
  const {
    error: inventoryError,
    inventory,
    loading: inventoryLoading,
  } = useProviderInventory<ProviderInventory>({
    provider,
  });
  const permissions = useGetDeleteAndEditAccessReview({ model: ProviderModel, namespace });
  const data: ProviderData = { inventory: inventory ?? undefined, permissions, provider };

  const { canInspect, disabledReason, isVsphere } = useCanInspectProvider(provider);

  const onClickInspectVms = (): void => {
    launcher<InspectVirtualMachinesModalProps>(InspectVirtualMachinesModal, {
      provider,
    });
  };

  const inspectButton = isVsphere ? (
    <FlexItem>
      <Tooltip content={disabledReason} trigger={disabledReason ? undefined : 'manual'}>
        <Button
          variant={ButtonVariant.secondary}
          isDisabled={!canInspect}
          onClick={onClickInspectVms}
          data-testid="provider-inspect-vms-button"
        >
          {t('Inspect VMs')}
        </Button>
      </Tooltip>
    </FlexItem>
  ) : null;

  return (
    <PageHeadings
      model={ProviderModel}
      obj={provider}
      namespace={namespace}
      testId="resource-details-title"
      actions={
        <Flex
          direction={{ default: 'row' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsSm' }}
        >
          <FlexItem>
            <LearningExperienceButton />
          </FlexItem>
          {inspectButton}
          <FlexItem>
            <CreatePlanAction namespace={namespace} provider={provider} />
          </FlexItem>
          <FlexItem>
            <ProviderActionsDropdown data={data} />
          </FlexItem>
        </Flex>
      }
    >
      <ProviderPageHeaderAlerts
        provider={provider}
        inventoryLoading={inventoryLoading}
        inventoryError={inventoryError}
      />
    </PageHeadings>
  );
};

export default ProviderPageHeader;
