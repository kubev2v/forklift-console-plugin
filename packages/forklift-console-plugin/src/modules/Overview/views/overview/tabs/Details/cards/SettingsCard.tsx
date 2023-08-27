import React, { FC } from 'react';
import {
  EditCleanupMaxAgeModal,
  EditControllerCPULimitModal,
  EditControllerMemoryLimitModal,
  EditMaxVMInFlightModal,
  EditPreCopyIntervalModal,
  EditSnapshotPoolingIntervalModal,
} from 'src/modules/Overview/modal';
import { ModalHOC, useModal } from 'src/modules/Providers/modals';
import { DetailsItem } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

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

  const mustGatherAPICleanupMaxAge =
    obj?.spec?.['must_gather_api_cleanup_max_age'] === -1
      ? 'Disabled'
      : obj?.spec?.['must_gather_api_cleanup_max_age'];

  return (
    <Card>
      <CardTitle>{t('Settings')}</CardTitle>
      <CardBody>
        <DescriptionList
          columnModifier={{
            default: '1Col',
          }}
        >
          <DetailsItem
            title={'Max concurrent virtual machine migrations'}
            content={
              obj?.spec?.['controller_max_vm_inflight'] || (
                <span className="text-muted">{'20'}</span>
              )
            }
            moreInfoLink={
              'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.4/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#advanced-migration-options'
            }
            helpContent={
              <Text>
                {t(
                  'Sets the maximum number of VMs that can be migrated simultaneously. The default value is 20 virtual machines.',
                )}
              </Text>
            }
            crumbs={['spec', 'controller_max_vm_inflight']}
            onEdit={() => showModal(<EditMaxVMInFlightModal resource={obj} />)}
          />

          <DetailsItem
            title={'Must gather cleanup after (hours)'}
            content={mustGatherAPICleanupMaxAge || <span className="text-muted">{'Disabled'}</span>}
            moreInfoLink={
              'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.4/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#advanced-migration-options'
            }
            helpContent={
              <Text>
                {t(
                  "Specifies the duration for retaining 'must gather' reports before they are automatically deleted. The default value is -1, which implies automatic cleanup is disabled.",
                )}
              </Text>
            }
            crumbs={['spec', 'must_gather_api_cleanup_max_age']}
            onEdit={() => showModal(<EditCleanupMaxAgeModal resource={obj} />)}
          />

          <DetailsItem
            title={'Controller main container CPU limit'}
            content={
              obj?.spec?.['controller_container_limits_cpu'] || (
                <span className="text-muted">{'500m'}</span>
              )
            }
            moreInfoLink={
              'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.4/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#advanced-migration-options'
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
            content={
              obj?.spec?.['controller_container_limits_memory'] || (
                <span className="text-muted">{'800Mi'}</span>
              )
            }
            moreInfoLink={
              'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.4/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#advanced-migration-options'
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
            title={'Precopy interval (minutes)'}
            content={
              obj?.spec?.['controller_precopy_interval'] || (
                <span className="text-muted">{'60'}</span>
              )
            }
            moreInfoLink={
              'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.4/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#advanced-migration-options'
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
            content={
              obj?.spec?.['controller_snapshot_status_check_rate_seconds'] || (
                <span className="text-muted">{'10'}</span>
              )
            }
            moreInfoLink={
              'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.4/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#advanced-migration-options'
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
