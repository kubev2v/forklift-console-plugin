import type { FC } from 'react';
import { ModalHOC, useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { EditControllerCPULimitModal } from 'src/overview/modal/EditControllerCPULimitModal';
import { EditControllerMemoryLimitModal } from 'src/overview/modal/EditControllerMemoryLimitModal';
import { EditInventoryMemoryLimitModal } from 'src/overview/modal/EditInventoryMemoryLimitModal';
import { EditMaxVMInFlightModal } from 'src/overview/modal/EditMaxVMInFlightModal';
import { EditPreCopyIntervalModal } from 'src/overview/modal/EditPreCopyIntervalModal';
import { EditSnapshotPoolingIntervalModal } from 'src/overview/modal/EditSnapshotPoolingIntervalModal';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1ForkliftController } from '@kubev2v/types';
import { Card, CardBody, CardTitle, DescriptionList, Text } from '@patternfly/react-core';
import { MAX_CONCURRENT_VIRTUAL_MACHINE_MIGRATIONS, MTV_SETTINGS } from '@utils/links';

type SettingsCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
};

type ForkliftControllerSpec = {
  controller_max_vm_inflight?: string;
  controller_container_limits_cpu?: string;
  controller_container_limits_memory?: string;
  inventory_container_limits_memory?: string;
  controller_precopy_interval?: string;
  controller_snapshot_status_check_rate_seconds?: string;
};

const SettingsCardInner: FC<SettingsCardProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();
  const controllerSpec = obj?.spec as ForkliftControllerSpec;

  return (
    <Card>
      <CardTitle className="forklift-title">{t('Settings')}</CardTitle>
      <CardBody>
        <DescriptionList
          columnModifier={{
            default: '1Col',
          }}
        >
          <DetailsItem
            title={t('Max concurrent virtual machine migrations')}
            showHelpIconNextToTitle={true}
            content={
              controllerSpec?.controller_max_vm_inflight ?? (
                <span className="text-muted">{'20'}</span>
              )
            }
            moreInfoLink={MAX_CONCURRENT_VIRTUAL_MACHINE_MIGRATIONS}
            helpContent={
              <ForkliftTrans>
                Sets the maximum number of virtual machines or disks that can be migrated
                simultaneously, varies by the source provider type and by the settings of the
                migration.
                <br />
                <br />
                The default value is 20 virtual machines or disks.
              </ForkliftTrans>
            }
            crumbs={['spec', 'controller_max_vm_inflight']}
            onEdit={() => {
              showModal(<EditMaxVMInFlightModal resource={obj} />);
            }}
          />
          <DetailsItem
            title={t('Controller main container CPU limit')}
            showHelpIconNextToTitle={true}
            content={
              controllerSpec?.controller_container_limits_cpu ?? (
                <span className="text-muted">{'500m'}</span>
              )
            }
            moreInfoLink={MTV_SETTINGS}
            helpContent={
              <Text>
                {t(
                  'Defines the CPU limits allocated to the main container in the controller pod. The default value is 500 milliCPU.',
                )}
              </Text>
            }
            crumbs={['spec', 'controller_container_limits_cpu']}
            onEdit={() => {
              showModal(<EditControllerCPULimitModal resource={obj} />);
            }}
          />
          <DetailsItem
            title={t('Controller main container Memory limit')}
            showHelpIconNextToTitle={true}
            content={
              controllerSpec?.controller_container_limits_memory ?? (
                <span className="text-muted">{'800Mi'}</span>
              )
            }
            moreInfoLink={MTV_SETTINGS}
            helpContent={
              <Text>
                {t(
                  'Sets the memory limits allocated to the main container in the controller pod. The default value is 800Mi.',
                )}
              </Text>
            }
            crumbs={['spec', 'controller_container_limits_memory']}
            onEdit={() => {
              showModal(<EditControllerMemoryLimitModal resource={obj} />);
            }}
          />
          <DetailsItem
            title={t('Controller inventory container memory limit')}
            showHelpIconNextToTitle={true}
            content={
              controllerSpec?.inventory_container_limits_memory ?? (
                <span className="text-muted">{'1000Mi'}</span>
              )
            }
            moreInfoLink={MTV_SETTINGS}
            helpContent={
              <Text>
                {t(
                  'Sets the memory limits allocated to the inventory container in the controller pod. The default value is 1000Mi.',
                )}
              </Text>
            }
            crumbs={['spec', 'inventory_container_limits_memory']}
            onEdit={() => {
              showModal(<EditInventoryMemoryLimitModal resource={obj} />);
            }}
          />
          <DetailsItem
            title={t('Precopy interval (minutes)')}
            showHelpIconNextToTitle={true}
            content={
              controllerSpec?.controller_precopy_interval ?? (
                <span className="text-muted">{'60'}</span>
              )
            }
            moreInfoLink={MTV_SETTINGS}
            helpContent={
              <Text>
                {t(
                  'Controls the interval at which a new snapshot is requested prior to initiating a warm migration. The default value is 60 minutes.',
                )}
              </Text>
            }
            crumbs={['spec', 'controller_precopy_interval']}
            onEdit={() => {
              showModal(<EditPreCopyIntervalModal resource={obj} />);
            }}
          />
          <DetailsItem
            title={t('Snapshot polling interval (seconds)')}
            showHelpIconNextToTitle={true}
            content={
              controllerSpec?.controller_snapshot_status_check_rate_seconds ?? (
                <span className="text-muted">{'10'}</span>
              )
            }
            moreInfoLink={MTV_SETTINGS}
            helpContent={
              <Text>
                {t(
                  'Determines the frequency with which the system checks the status of snapshot creation or removal during oVirt warm migration. The default value is 10 seconds.',
                )}
              </Text>
            }
            crumbs={['spec', 'controller_snapshot_status_check_rate_seconds']}
            onEdit={() => {
              showModal(<EditSnapshotPoolingIntervalModal resource={obj} />);
            }}
          />
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

const SettingsCard: FC<SettingsCardProps> = (props) => (
  <ModalHOC>
    <SettingsCardInner {...props} />
  </ModalHOC>
);

export default SettingsCard;
