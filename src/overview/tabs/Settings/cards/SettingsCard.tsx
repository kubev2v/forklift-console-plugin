import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import TabTitle from 'src/overview/components/TabTitle';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1ForkliftController } from '@kubev2v/types';
import {
  Alert,
  AlertGroup,
  AlertVariant,
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
} from '@patternfly/react-core';

import EditControllerCPULimit from '../fields/EditControllerCPULimit';
import EditControllerMemoryLimit from '../fields/EditControllerMemoryLimit';
import EditInventoryMemoryLimit from '../fields/EditInventoryMemoryLimit';
import EditMaxVMInFlight from '../fields/EditMaxVMInFlight';
import EditPreCopyInterval from '../fields/EditPreCopyInterval';
import EditSnapshotPoolingInterval from '../fields/EditSnapshotPoolingInterval';

type SettingsCardProps = {
  obj?: V1beta1ForkliftController;
};

export type ForkliftControllerSpec = {
  controller_max_vm_inflight?: string;
  controller_container_limits_cpu?: string;
  controller_container_limits_memory?: string;
  inventory_container_limits_memory?: string;
  controller_precopy_interval?: string;
  controller_snapshot_status_check_rate_seconds?: string;
};

const SettingsCard: FC<SettingsCardProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const [showSaved, setShowSaved] = useState(false);

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleShowSaved = useCallback(() => {
    setShowSaved(true);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setShowSaved(false);
      toastTimeoutRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <AlertGroup isToast isLiveRegion className="forklift-toast-alert-group">
        {showSaved && <Alert variant={AlertVariant.success} title={t('All changes saved')} />}
      </AlertGroup>
      <Card>
        <CardTitle className="forklift-title">
          <TabTitle
            title={t('Settings')}
            helpContent={t(
              'Settings are applied across all projects on the Migration Toolkit for Virtualization operator.',
            )}
          />
        </CardTitle>
        <CardBody>
          <DescriptionList
            className="forklift-settings__description-list"
            columnModifier={{
              default: '1Col',
            }}
          >
            <EditMaxVMInFlight resource={obj} onSave={handleShowSaved} />

            <EditControllerCPULimit resource={obj} onSave={handleShowSaved} />

            <EditControllerMemoryLimit resource={obj} onSave={handleShowSaved} />

            <EditInventoryMemoryLimit resource={obj} onSave={handleShowSaved} />

            <EditPreCopyInterval resource={obj} onSave={handleShowSaved} />

            <EditSnapshotPoolingInterval resource={obj} onSave={handleShowSaved} />
          </DescriptionList>
        </CardBody>
      </Card>
    </>
  );
};

export default SettingsCard;
