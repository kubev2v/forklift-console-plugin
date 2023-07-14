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
            title={'Precopy interval (minutes)'}
            content={
              obj?.spec?.['controller_precopy_interval'] || (
                <span className="text-muted">{'60'}</span>
              )
            }
            moreInfoLink={
              'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.4/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#advanced-migration-options'
            }
            helpContent={<Text>{'The interval in minutes for precopy. Default value is 60.'}</Text>}
            crumbs={['spec', 'controller_precopy_interval']}
            onEdit={() => showModal(<EditPreCopyIntervalModal resource={obj} />)}
          />

          <DetailsItem
            title={'Snapshot pooling interval (seconds)'}
            content={
              obj?.spec?.['controller_snapshot_status_check_rate_seconds'] || (
                <span className="text-muted">{'10'}</span>
              )
            }
            moreInfoLink={
              'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.4/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#advanced-migration-options'
            }
            helpContent={
              <Text>{'The interval in seconds for snapshot pooling. Default value is 10.'}</Text>
            }
            crumbs={['spec', 'controller_snapshot_status_check_rate_seconds']}
            onEdit={() => showModal(<EditSnapshotPoolingIntervalModal resource={obj} />)}
          />

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
                {'Maximum number of concurrent virtual machine migrations. Default value is 20.'}
              </Text>
            }
            crumbs={['spec', 'controller_max_vm_inflight']}
            onEdit={() => showModal(<EditMaxVMInFlightModal resource={obj} />)}
          />

          <DetailsItem
            title={'Must gather cleanup after (hours)'}
            content={
              obj?.spec?.['must_gather_api_cleanup_max_age'] || (
                <span className="text-muted">{'Never'}</span>
              )
            }
            moreInfoLink={
              'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.4/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#advanced-migration-options'
            }
            helpContent={
              <Text>
                {
                  'The maximum age in hours for must gather cleanup. Default value is -1, which implies never.'
                }
              </Text>
            }
            crumbs={['spec', 'must_gather_api_cleanup_max_age']}
            onEdit={() => showModal(<EditCleanupMaxAgeModal resource={obj} />)}
          />

          <DetailsItem
            title={'Controller CPU limit'}
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
                {
                  'The limit for CPU usage by the controller, specified in milliCPU. Default value is 500m.'
                }
              </Text>
            }
            crumbs={['spec', 'controller_container_limits_cpu']}
            onEdit={() => showModal(<EditControllerCPULimitModal resource={obj} />)}
          />

          <DetailsItem
            title={'Controller Memory limit'}
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
                {
                  'The limit for memory usage by the controller, specified in Megabytes (Mi). Default value is 800Mi.'
                }
              </Text>
            }
            crumbs={['spec', 'controller_container_limits_memory']}
            onEdit={() => showModal(<EditControllerMemoryLimitModal resource={obj} />)}
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
