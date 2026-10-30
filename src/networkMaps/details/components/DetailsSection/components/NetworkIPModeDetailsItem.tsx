import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';
import EditNetworkIPMode from 'src/networkMaps/details/components/DetailsSection/components/EditNetworkIPMode';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModel, type V1beta1NetworkMap } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { getNetworkMapMappings } from '@utils/crds/maps/selectors';
import { isEmpty } from '@utils/helpers';
import useGetDeleteAndEditAccessReview from '@utils/hooks/useGetDeleteAndEditAccessReview';

const getModeLabel = (mode: string | undefined, translate: (value: string) => string): string => {
  switch (mode) {
    case 'dhcp':
      return translate('DHCP');
    case 'none':
      return translate('Do not configure IP');
    case 'preserve':
      return translate('Preserve static IPs');
    case undefined:
      return translate('Inherit Plan setting');
    default:
      return translate('Unknown');
  }
};

type NetworkIPModeDetailsItemProps = {
  resource: V1beta1NetworkMap;
};

const NetworkIPModeDetailsItem: FC<NetworkIPModeDetailsItemProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const { canPatch } = useGetDeleteAndEditAccessReview({
    model: NetworkMapModel,
    namespace: getNamespace(resource),
  });
  const modes = getNetworkMapMappings(resource).map((mapping) => mapping.networkIPMode);
  const distinctModes = [...new Set(modes)];
  let summary = t('Per mapping');
  if (isEmpty(distinctModes)) {
    summary = getModeLabel(undefined, t);
  } else if (distinctModes.length === 1) {
    summary = getModeLabel(distinctModes[0], t);
  }

  return (
    <DetailsItem
      canEdit={canPatch}
      content={
        <Label color="grey" isCompact>
          {summary}
        </Label>
      }
      crumbs={['spec', 'map', 'networkIPMode']}
      helpContent={t(
        'Controls how IP configuration is handled for each NetworkMap mapping. An unset value inherits the Plan setting.',
      )}
      onEdit={() => {
        launchOverlay(EditNetworkIPMode, { resource });
      }}
      testId="network-ip-mode-detail-item"
      title={t('Network IP mode')}
    />
  );
};

export default NetworkIPModeDetailsItem;
