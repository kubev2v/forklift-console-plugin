import { type FC, type PropsWithChildren, type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Linkify from 'react-linkify';
import { useHistory } from 'react-router';
import { PlanConditionType } from 'src/modules/Plans/utils/types/PlanCondition';
import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import { EMPTY_MSG } from 'src/utils/constants';
import { ForkliftTrans } from 'src/utils/i18n';

import type {
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1PlanStatusConditions,
  V1beta1StorageMap,
} from '@kubev2v/types';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
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

type PlanCriticalConditionProps = PropsWithChildren & {
  plan: V1beta1Plan;
  condition: V1beta1PlanStatusConditions;
  storageMaps: V1beta1StorageMap[];
  networkMaps: V1beta1NetworkMap[];
  sourceStorages: InventoryStorage[];
  sourceNetworks: InventoryNetwork[];
};

const PlanCriticalCondition: FC<PlanCriticalConditionProps> = ({
  condition,
  networkMaps,
  plan,
  sourceNetworks,
  sourceStorages,
  storageMaps,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const planURL = getPlanURL(plan);
  const type = condition.type as PlanConditionType;

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

  const showList =
    type === PlanConditionType.VMStorageNotMapped || type === PlanConditionType.VMNetworksNotMapped;

  const troubleshoot: ReactNode = [
    PlanConditionType.VMNetworksNotMapped,
    PlanConditionType.VMStorageNotMapped,
    PlanConditionType.VMMultiplePodNetworkMappings,
  ].includes(type) ? (
    <ForkliftTrans>
      To troubleshoot, check and edit your plan{' '}
      <Button
        isInline
        variant={ButtonVariant.link}
        onClick={() => {
          history.push(`${planURL}/mappings`);
        }}
      >
        mappings
      </Button>
      .
    </ForkliftTrans>
  ) : (
    t('To troubleshoot, check the Forklift controller pod logs.')
  );

  return (
    <Alert
      title={`${t('The plan is not ready')} - ${type}`}
      variant={AlertVariant.danger}
      isExpandable={showList}
    >
      <Stack hasGutter>
        <TextContent className="forklift-providers-list-header__alert">
          <Text component={TextVariants.p}>
            <Linkify>{condition.message ?? EMPTY_MSG}</Linkify>
            {condition.message?.endsWith('.') ? ' ' : '. '}
            {troubleshoot}
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

export default PlanCriticalCondition;
