import { type FC, type PropsWithChildren, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SmartLinkify from 'src/components/common/SmartLinkify';
import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import { EMPTY_MSG } from 'src/utils/constants';

import type {
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1PlanStatusConditions,
  V1beta1StorageMap,
} from '@kubev2v/types';
import {
  Alert,
  AlertVariant,
  List,
  ListItem,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';
import { getPlanNetworkMapName, getPlanStorageMapName } from '@utils/crds/plans/selectors';
import { getPlanURL } from '@utils/crds/plans/utils';
import { isEmpty } from '@utils/helpers';

import { PlanConditionType } from '../utils/constants';

import TroubleshootMessage from './TroubleshootMessage';

type PlanCriticalAlertProps = PropsWithChildren & {
  plan: V1beta1Plan;
  condition: V1beta1PlanStatusConditions | undefined;
  storageMaps: V1beta1StorageMap[];
  networkMaps: V1beta1NetworkMap[];
  sourceStorages: InventoryStorage[];
  sourceNetworks: InventoryNetwork[];
};

const PlanCriticalAlert: FC<PlanCriticalAlertProps> = ({
  condition,
  networkMaps,
  plan,
  sourceNetworks,
  sourceStorages,
  storageMaps,
}) => {
  const { t } = useTranslation();

  const type = condition?.type as PlanConditionType;

  const planStorageMapName = getPlanStorageMapName(plan);
  const planNetworkMapName = getPlanNetworkMapName(plan);

  const planStorageMap = useMemo(
    () => storageMaps.find((map) => getName(map) === planStorageMapName),
    [storageMaps, planStorageMapName],
  );

  const planNetworkMap = useMemo(
    () => networkMaps.find((map) => getName(map) === planNetworkMapName),
    [networkMaps, planNetworkMapName],
  );

  const missingStorage = useMemo(
    () =>
      sourceStorages.filter(
        (src) => !planStorageMap?.spec?.map.some((map) => map.source.name === src.name),
      ),
    [planStorageMap, sourceStorages],
  );

  const missingNetworks = useMemo(
    () =>
      sourceNetworks.filter(
        (src) => !planNetworkMap?.spec?.map.some((map) => map.source.name === src.name),
      ),
    [planNetworkMap, sourceNetworks],
  );

  if (isEmpty(condition)) return null;

  const showList =
    type === PlanConditionType.VMStorageNotMapped || type === PlanConditionType.VMNetworksNotMapped;

  return (
    <Alert title={t('The plan is not ready')} variant={AlertVariant.danger} isExpandable={showList}>
      <Stack hasGutter>
        <TextContent className="forklift-providers-list-header__alert">
          <Text component={TextVariants.p}>
            <SmartLinkify>{condition?.message ?? EMPTY_MSG}</SmartLinkify>
            {condition?.message?.endsWith('.') ? ' ' : '. '}
            <TroubleshootMessage planURL={getPlanURL(plan)} type={type} />
          </Text>
        </TextContent>
        {showList && (
          <StackItem>
            <List>
              {type === PlanConditionType.VMStorageNotMapped &&
                missingStorage.map((storage) => (
                  <ListItem key={storage?.name}>{storage?.name}</ListItem>
                ))}
              {type === PlanConditionType.VMNetworksNotMapped &&
                missingNetworks.map((network) => (
                  <ListItem key={network?.name}>{network?.name}</ListItem>
                ))}
            </List>
          </StackItem>
        )}
      </Stack>
    </Alert>
  );
};

export default PlanCriticalAlert;
