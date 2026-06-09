import { type FC, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import type { V1beta1NetworkMap } from '@forklift-ui/types';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { DEFAULT_NETWORK } from '@utils/constants';
import { NetworkMapFieldId, type NetworkMapping } from '@utils/crds/maps/types';
import { useForkliftTranslation } from '@utils/i18n';
import { IgnoreNetwork } from '@utils/mappings/constants';

type PlanOwnerAlertProps = {
  networkMap: V1beta1NetworkMap;
};

export const PlanOwnerAlert: FC<PlanOwnerAlertProps> = ({ networkMap }) => {
  const { t } = useForkliftTranslation();
  const { control } = useFormContext();
  const watchedMappings: NetworkMapping[] = useWatch({
    control,
    name: NetworkMapFieldId.NetworkMap,
  });

  const isOwnedByPlan = useMemo(
    () => networkMap?.metadata?.ownerReferences?.some((ref) => ref.kind === 'Plan'),
    [networkMap],
  );

  const hasMultusTarget = useMemo(
    () =>
      watchedMappings?.some((mapping) => {
        const targetName = mapping?.[NetworkMapFieldId.TargetNetwork]?.name;
        return targetName && targetName !== DEFAULT_NETWORK && targetName !== IgnoreNetwork.Label;
      }),
    [watchedMappings],
  );

  if (!isOwnedByPlan || !hasMultusTarget) {
    return null;
  }

  return (
    <Alert
      variant={AlertVariant.info}
      isInline
      isPlain
      title={t(
        "This network map is used by a plan. Target networks must be in the plan's target namespace or the default namespace.",
      )}
      className="pf-v6-u-mt-sm"
    />
  );
};
