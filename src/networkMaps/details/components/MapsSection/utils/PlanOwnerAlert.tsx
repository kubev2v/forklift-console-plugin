import { type FC, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import type { V1beta1NetworkMap } from '@forklift-ui/types';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { POD } from '@utils/constants';
import { NetworkMapFieldId } from '@utils/crds/maps/types';
import { useForkliftTranslation } from '@utils/i18n';
import { IgnoreNetwork } from '@utils/mappings/constants';

import type { NetworkEditFormValues } from './types';

type PlanOwnerAlertProps = {
  networkMap: V1beta1NetworkMap;
};

export const PlanOwnerAlert: FC<PlanOwnerAlertProps> = ({ networkMap }) => {
  const { t } = useForkliftTranslation();
  const defaultNetworkLabel = t('Default network');
  const { control } = useFormContext<NetworkEditFormValues>();
  const watchedMappings = useWatch({
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
        const target = mapping?.[NetworkMapFieldId.TargetNetwork];
        const isDefaultTarget = target?.id === POD || target?.name === defaultNetworkLabel;
        return Boolean(target?.name) && !isDefaultTarget && target?.name !== IgnoreNetwork.Label;
      }),
    [defaultNetworkLabel, watchedMappings],
  );

  if (!isOwnedByPlan || !hasMultusTarget) {
    return null;
  }

  return (
    <Alert
      className="pf-v6-u-mt-sm"
      isInline
      isPlain
      title={t(
        "This network map is used by a plan. Target networks must be in the plan's target namespace or the default namespace.",
      )}
      variant={AlertVariant.info}
    />
  );
};
