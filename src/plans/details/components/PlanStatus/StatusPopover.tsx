import type { FC } from 'react';
import { useNavigate } from 'react-router';
import PlanCutoverMigrationModal from 'src/plans/actions/components/CutoverModal/PlanCutoverMigrationModal';
import type { PlanModalProps } from 'src/plans/actions/components/types';

import { PlanModelRef, type V1beta1Plan } from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Flex,
  Icon,
  List,
  ListItem,
  Popover,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { PF_LABEL_STATUS } from '@utils/constants';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { getResourceUrl } from '@utils/getResourceUrl';

import { STATUS_POPOVER_VMS_COUNT_THRESHOLD } from './utils/constants';
import { migrationStatusIconMap } from './utils/statusIconMapper';
import {
  type MigrationVirtualMachinesStatusCountObjectVM,
  MigrationVirtualMachineStatus,
} from './utils/types';
import { getPopoverMessageByStatus } from './utils/utils';

type StatusPopoverProps = {
  count: number;
  plan: V1beta1Plan;
  status: MigrationVirtualMachineStatus;
  vms: MigrationVirtualMachinesStatusCountObjectVM[];
};

const StatusPopover: FC<StatusPopoverProps> = ({ count, plan, status, vms }) => {
  const launchOverlay = useOverlay();
  const navigate = useNavigate();

  const { actionLabel, body, header } = getPopoverMessageByStatus(status, count);

  const openScheduleCutoverModal = () => {
    launchOverlay<PlanModalProps>(PlanCutoverMigrationModal, { plan });
  };

  const navigateToVMsTab = () => {
    const url = `${getResourceUrl({ name: getName(plan), namespace: getNamespace(plan), reference: PlanModelRef })}/vms`;
    navigate(url)?.catch(() => undefined);
  };
  return (
    <Popover
      bodyContent={
        <Stack hasGutter>
          {body && <StackItem>{body}</StackItem>}
          <StackItem>
            <List>
              {vms.map(({ failedTaskName, name }, idx) => {
                if (idx >= STATUS_POPOVER_VMS_COUNT_THRESHOLD) {
                  return null;
                } // show only first items
                return (
                  <ListItem key={name}>
                    {name}
                    {failedTaskName && (
                      <ListItem
                        icon={
                          <Icon status={PF_LABEL_STATUS.DANGER}>
                            <TimesIcon />
                          </Icon>
                        }
                      >
                        {failedTaskName}
                      </ListItem>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </StackItem>

          <StackItem>
            <Button
              isInline
              onClick={() => {
                if (status === MigrationVirtualMachineStatus.Paused) {
                  openScheduleCutoverModal();
                  return;
                }

                navigateToVMsTab();
              }}
              variant={ButtonVariant.link}
            >
              {actionLabel}
            </Button>
          </StackItem>
        </Stack>
      }
      headerContent={header}
      triggerAction="hover"
    >
      <Flex flexWrap={{ default: 'nowrap' }} gap={{ default: 'gapXs' }}>
        {migrationStatusIconMap[status]}
        <Button isInline onClick={navigateToVMsTab} variant={ButtonVariant.link}>
          {count}
        </Button>
      </Flex>
    </Popover>
  );
};

export default StatusPopover;
