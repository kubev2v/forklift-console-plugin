import React, { FC } from 'react';
import {
  EditControllerCPULimitModal,
  EditControllerMemoryLimitModal,
  EditInventoryMemoryLimitModal,
  EditMaxVMInFlightModal,
  EditPreCopyIntervalModal,
  EditSnapshotPoolingIntervalModal,
} from 'src/modules/Overview/modal';
import { ModalHOC, useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1ForkliftController } from '@kubev2v/types';
import { Card, CardBody, CardTitle, DescriptionList, Text } from '@patternfly/react-core';

type SettingsCardProps = {
  obj?: V1beta1ForkliftController;
  loaded?: boolean;
  loadError?: unknown;
};

const SettingsCard_: FC<SettingsCardProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

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
            title={'Max concurrent virtual machine migrations'}
            showHelpIconNextToTitle={true}
            content={
              obj?.spec?.['controller_max_vm_inflight'] || (
                <span className="text-muted">{'20'}</span>
              )
            }
            moreInfoLink={
              'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.8/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#max-concurrent-vms_mtv'
            }
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
            onEdit={() => showModal(<EditMaxVMInFlightModal resource={obj} />)}
          />

          <DetailsItem
            title={'Controller main container CPU limit'}
            showHelpIconNextToTitle={true}
            content={
              obj?.spec?.['controller_container_limits_cpu'] || (
                <span className="text-muted">{'500m'}</span>
              )
            }
            moreInfoLink={
              'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.8/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#mtv-settings_mtv'
            }
            helpContent={
              <Text>
                {t(
                  'Defines the CPU limits allocated to the main container in the controller pod. The default value is 500 milliCPU.',
                )}
              </Text>
            }
            crumbs={['spec', 'controller_container_limits_cpu']}
            onEdit={() => showModal(<EditControllerCPULimitModal resource={obj} />)}
          />

          <DetailsItem
            title={'Controller main container Memory limit'}
            showHelpIconNextToTitle={true}
            content={
              obj?.spec?.['controller_container_limits_memory'] || (
                <span className="text-muted">{'800Mi'}</span>
              )
            }
            moreInfoLink={
              'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.8/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#mtv-settings_mtv'
            }
            helpContent={
              <Text>
                {t(
                  'Sets the memory limits allocated to the main container in the controller pod. The default value is 800Mi.',
                )}
              </Text>
            }
            crumbs={['spec', 'controller_container_limits_memory']}
            onEdit={() => showModal(<EditControllerMemoryLimitModal resource={obj} />)}
          />

          <DetailsItem
            title={'Controller inventory container memory limit'}
            showHelpIconNextToTitle={true}
            content={
              obj?.spec?.['inventory_container_limits_memory'] || (
                <span className="text-muted">{'1000Mi'}</span>
              )
            }
            moreInfoLink={
              'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.8/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#mtv-settings_mtv'
            }
            helpContent={
              <Text>
                {t(
                  'Sets the memory limits allocated to the inventory container in the controller pod. The default value is 1000Mi.',
                )}
              </Text>
            }
            crumbs={['spec', 'inventory_container_limits_memory']}
            onEdit={() => showModal(<EditInventoryMemoryLimitModal resource={obj} />)}
          />

          <DetailsItem
            title={'Precopy interval (minutes)'}
            showHelpIconNextToTitle={true}
            content={
              obj?.spec?.['controller_precopy_interval'] || (
                <span className="text-muted">{'60'}</span>
              )
            }
            moreInfoLink={
              'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.8/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#mtv-settings_mtv'
            }
            helpContent={
              <Text>
                {t(
                  'Controls the interval at which a new snapshot is requested prior to initiating a warm migration. The default value is 60 minutes.',
                )}
              </Text>
            }
            crumbs={['spec', 'controller_precopy_interval']}
            onEdit={() => showModal(<EditPreCopyIntervalModal resource={obj} />)}
          />

          <DetailsItem
            title={'Snapshot polling interval (seconds)'}
            showHelpIconNextToTitle={true}
            content={
              obj?.spec?.['controller_snapshot_status_check_rate_seconds'] || (
                <span className="text-muted">{'10'}</span>
              )
            }
            moreInfoLink={
              'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.8/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#mtv-settings_mtv'
            }
            helpContent={
              <Text>
                {t(
                  'Determines the frequency with which the system checks the status of snapshot creation or removal during oVirt warm migration. The default value is 10 seconds.',
                )}
              </Text>
            }
            crumbs={['spec', 'controller_snapshot_status_check_rate_seconds']}
            onEdit={() => showModal(<EditSnapshotPoolingIntervalModal resource={obj} />)}
          />
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export const SettingsCard: React.FC<SettingsCardProps> = (props) => (
  <ModalHOC>
    <SettingsCard_ {...props} />
  </ModalHOC>
);

export default SettingsCard;
