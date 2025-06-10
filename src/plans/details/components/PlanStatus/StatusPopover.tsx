import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import PlanCutoverMigrationModal from 'src/plans/actions/components/CutoverModal/PlanCutoverMigrationModal';

import { PlanModelRef, type V1beta1Plan } from '@kubev2v/types';
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
import { getName, getNamespace } from '@utils/crds/common/selectors';

import { STATUS_POPOVER_VMS_COUNT_THRESHOLD } from './utils/constants';
import { migrationStatusIconMap } from './utils/statusIconMapper';
import {
  type MigrationVirtualMachinesStatusCountObjectVM,
  MigrationVirtualMachineStatus,
} from './utils/types';
import { getPopoverMessageByStatus } from './utils/utils';

type StatusPopoverProps = {
  status: MigrationVirtualMachineStatus;
  count: number;
  vms: MigrationVirtualMachinesStatusCountObjectVM[];
  plan: V1beta1Plan;
};

const StatusPopover: FC<StatusPopoverProps> = ({ count, plan, status, vms }) => {
  const { showModal } = useModal();
  const navigate = useNavigate();

  const { actionLabel, body, header } = getPopoverMessageByStatus(status, count);

  const openScheduleCutoverModal = () => {
    showModal(<PlanCutoverMigrationModal plan={plan} />);
  };

  const navigateToVMsTab = () => {
    const url = `${getResourceUrl({ name: getName(plan), namespace: getNamespace(plan), reference: PlanModelRef })}/vms`;
    navigate(url);
  };
  return (
    <Popover
      triggerAction="hover"
      headerContent={header}
      bodyContent={
        <Stack hasGutter>
          {body && <StackItem>{body}</StackItem>}
          <StackItem>
            <List>
              {vms.map(({ failedTaskName, name }, idx) => {
                if (idx >= STATUS_POPOVER_VMS_COUNT_THRESHOLD) return null; // show only first items
                return (
                  <ListItem key={name}>
                    {name}
                    {failedTaskName && (
                      <ListItem
                        icon={
                          <Icon status="danger">
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
              variant={ButtonVariant.link}
              onClick={() => {
                if (status === MigrationVirtualMachineStatus.Paused) {
                  openScheduleCutoverModal();
                  return;
                }

                navigateToVMsTab();
              }}
              isInline
            >
              {actionLabel}
            </Button>
          </StackItem>
        </Stack>
      }
    >
      <Flex gap={{ default: 'gapXs' }}>
        {migrationStatusIconMap[status]}
        <Button isInline variant={ButtonVariant.link} onClick={navigateToVMsTab}>
          {count}
        </Button>
      </Flex>
    </Popover>
  );
};

export default StatusPopover;
