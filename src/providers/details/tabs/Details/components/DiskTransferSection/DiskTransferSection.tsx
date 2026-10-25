import type { FC } from 'react';
import { VddkSetupMode } from 'src/providers/utils/constants';

import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import {
  CopyApplianceTemplateModelGroupVersionKind,
  type V1beta1CopyApplianceTemplate,
} from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, PageSection, Stack, StackItem } from '@patternfly/react-core';
import { FEATURE_NAMES } from '@utils/constants';
import { getName, getNamespace, getType } from '@utils/crds/common/selectors';
import { getCopyApplianceTemplateName } from '@utils/crds/providers/selectors';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { ProviderData } from '@utils/providers/types';

import {
  COPY_APPLIANCE_SETTING_FIELDS,
  COPY_APPLIANCE_SETTING_GETTERS,
} from '../DetailsSection/copyAppliancePlacementConfig';

import DiskTransferDetails from './DiskTransferDetails';
import { getCopyApplianceDisplayStatus } from './diskTransferDisplay';
import EditDiskTransfer from './EditDiskTransfer';
import { getDiskTransferMethod } from './getDiskTransferMethod';
import { isMissingCopyApplianceTemplate } from './isMissingCopyApplianceTemplate';

type DiskTransferSectionProps = { data: ProviderData };

const DiskTransferSection: FC<DiskTransferSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const { isFeatureEnabled } = useFeatureFlags();
  const { permissions, provider } = data;
  const namespace = getNamespace(provider);
  const templateName = getCopyApplianceTemplateName(provider);
  const isVsphere = getType(provider) === PROVIDER_TYPES.vsphere;
  const copyApplianceEnabled = isFeatureEnabled(FEATURE_NAMES.COPY_APPLIANCE);

  const [watchedTemplate, loaded, loadError] = useK8sWatchResource<V1beta1CopyApplianceTemplate>(
    isVsphere && namespace && templateName && copyApplianceEnabled
      ? {
          groupVersionKind: CopyApplianceTemplateModelGroupVersionKind,
          name: templateName,
          namespace,
          namespaced: true,
        }
      : null,
  );

  if (!isVsphere || !provider || !permissions) {
    return null;
  }

  const template =
    copyApplianceEnabled && getName(watchedTemplate) === templateName ? watchedTemplate : undefined;
  const templateIsMissing = isMissingCopyApplianceTemplate(loadError, templateName);
  const templateLookupUnavailable =
    copyApplianceEnabled && !templateIsMissing && (!loaded || Boolean(loadError));
  const method = getDiskTransferMethod(provider, Boolean(template));
  const hasPlacement = COPY_APPLIANCE_SETTING_FIELDS.some((field) =>
    Boolean(COPY_APPLIANCE_SETTING_GETTERS[field](provider)),
  );
  const isPending =
    method === VddkSetupMode.CopyAppliance &&
    !template &&
    (!hasPlacement || templateIsMissing || (loaded && !loadError));
  const templateStatus = getCopyApplianceDisplayStatus(Boolean(template), isPending);

  return (
    <PageSection className="forklift-page-section" hasBodyWrapper={false}>
      <Stack hasGutter>
        <StackItem>
          <SectionHeadingWithEdit
            data-testid="disk-transfer-edit-button"
            editable={
              permissions.canPatch &&
              (method !== VddkSetupMode.CopyAppliance || templateStatus !== 'unavailable')
            }
            onClick={() => {
              launchOverlay(EditDiskTransfer, {
                provider,
                template,
                templateLookupUnavailable,
              });
            }}
            title={t('Disk transfer method')}
          />
        </StackItem>
        {isPending && (
          <StackItem>
            <Alert
              isInline
              title={t('Copy appliance setup is incomplete')}
              variant={AlertVariant.warning}
            >
              {t(
                'The provider is set to use a copy appliance, but its template has not been created. Edit disk transfer to finish setup.',
              )}
            </Alert>
          </StackItem>
        )}
        {method === VddkSetupMode.CopyAppliance && templateStatus === 'unavailable' && (
          <StackItem>
            <Alert
              isInline
              title={t('Copy appliance template status is unavailable')}
              variant={AlertVariant.warning}
            >
              {t('Retry after the copy appliance templates finish loading.')}
            </Alert>
          </StackItem>
        )}
        <StackItem>
          <DiskTransferDetails
            method={method}
            provider={provider}
            template={template}
            templateStatus={templateStatus}
          />
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default DiskTransferSection;
