import { type FC, useMemo } from 'react';
import { useWatch } from 'react-hook-form';

import ExpandableReviewSection from '@components/ExpandableReviewSection/ExpandableReviewSection';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  useWizardContext,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { NetworkMapFieldId, NetworkMapType } from '../network-map/constants';

import NetworkMapReviewTable from './NetworkMapReviewTable';

const NetworkMapReviewSectionInner: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();

  const [netMapType, networkMap, existingNetMap, netMapName] = useWatch({
    control,
    name: [
      NetworkMapFieldId.NetworkMapType,
      NetworkMapFieldId.NetworkMap,
      NetworkMapFieldId.ExistingNetworkMap,
      NetworkMapFieldId.NetworkMapName,
    ],
  });

  const noMappingsSelected = useMemo(() => {
    if (!networkMap || isEmpty(networkMap)) {
      return true;
    }

    // Check if we have any valid mappings (both source and target networks must be present)
    const hasValidMapping = networkMap.some(
      (mapping) =>
        mapping?.[NetworkMapFieldId.SourceNetwork]?.name &&
        mapping?.[NetworkMapFieldId.TargetNetwork]?.name,
    );

    return !hasValidMapping;
  }, [networkMap]);

  if (netMapType === NetworkMapType.Existing) {
    return (
      <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
        <DescriptionListGroup>
          <DescriptionListTerm>{t('Network map')}</DescriptionListTerm>
          <DescriptionListDescription data-testid="review-network-map">
            {existingNetMap?.metadata?.name}
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    );
  }

  if (noMappingsSelected) {
    return <>{t('No network mappings selected')}</>;
  }

  if (netMapName) {
    return (
      <Stack hasGutter>
        <DescriptionList isHorizontal horizontalTermWidthModifier={{ default: '18ch' }}>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Network map name')}</DescriptionListTerm>
            <DescriptionListDescription>{netMapName}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>

        <NetworkMapReviewTable />
      </Stack>
    );
  }

  return <NetworkMapReviewTable />;
};

const NetworkMapReviewSection: FC = () => {
  const { goToStepById } = useWizardContext();

  return (
    <ExpandableReviewSection
      title={planStepNames[PlanWizardStepId.NetworkMap]}
      testId="review-network-map-section"
      onEditClick={() => {
        goToStepById(PlanWizardStepId.NetworkMap);
      }}
    >
      <NetworkMapReviewSectionInner />
    </ExpandableReviewSection>
  );
};

export default NetworkMapReviewSection;
