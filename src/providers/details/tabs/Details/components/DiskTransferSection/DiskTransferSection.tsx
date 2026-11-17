import type { FC } from 'react';
import { VddkSetupMode } from 'src/providers/utils/constants';
import { getDiskTransferMethod } from 'src/providers/utils/getDiskTransferMethod';

import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import {
  CopyApplianceTemplateModelGroupVersionKind,
  type V1beta1CopyApplianceTemplate,
} from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertVariant, PageSection, Stack, StackItem } from '@patternfly/react-core';
import { getName, getNamespace, getType } from '@utils/crds/common/selectors';
import { getCopyApplianceTemplateName } from '@utils/crds/providers/selectors';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { ProviderData } from '@utils/providers/types';

import DiskTransferDetails from './DiskTransferDetails';
import { getCopyApplianceDisplayStatus } from './diskTransferDisplay';
import EditDiskTransfer from './EditDiskTransfer';
import { isMissingCopyApplianceTemplate } from './isMissingCopyApplianceTemplate';

type DiskTransferSectionProps = { data: ProviderData };

const DiskTransferSection: FC<DiskTransferSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const { permissions, provider } = data;
  const namespace = getNamespace(provider);
  const templateName = getCopyApplianceTemplateName(provider);
  const isVsphere = getType(provider) === PROVIDER_TYPES.vsphere;

  const shouldWatchTemplate = isVsphere && Boolean(namespace) && Boolean(templateName);
  const [watchedTemplate, loaded, loadError] = useK8sWatchResource<V1beta1CopyApplianceTemplate>(
    shouldWatchTemplate
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

  const template = getName(watchedTemplate) === templateName ? watchedTemplate : undefined;
  const templateIsMissing = isMissingCopyApplianceTemplate(loadError, templateName);
  const templateLookupUnavailable = Boolean(loadError) && !templateIsMissing;
  const isTemplateLoading = shouldWatchTemplate && !loaded && !loadError;
  const method = getDiskTransferMethod(provider, Boolean(template));
  const isPending =
    method === VddkSetupMode.CopyAppliance && !template && !isTemplateLoading
      ? !templateLookupUnavailable
      : false;
  const templateStatus = getCopyApplianceDisplayStatus({
    isPending,
    loading: isTemplateLoading,
    templateExists: Boolean(template),
  });

  return (
    <PageSection className="forklift-page-section" hasBodyWrapper={false}>
      <Stack hasGutter>
        <StackItem>
          <SectionHeadingWithEdit
            data-testid="disk-transfer-edit-button"
            editable={permissions.canPatch}
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
              {t('Edit disk transfer to review the configuration or switch to another method.')}
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
