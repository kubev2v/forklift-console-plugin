import type { FC } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import {
  CopyApplianceTemplateModelGroupVersionKind,
  type V1beta1CopyApplianceTemplate,
} from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';
import { FEATURE_NAMES } from '@utils/constants';
import { getNamespace, getType } from '@utils/crds/common/selectors';
import { getCopyApplianceTemplateName } from '@utils/crds/providers/selectors';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { ProviderData } from '@utils/providers/types';

import CreateCopyApplianceTemplateModal from '../DetailsSection/CreateCopyApplianceTemplateModal';

import CopyApplianceTemplateSectionBody from './CopyApplianceTemplateSectionBody';

type CopyApplianceTemplateSectionProps = {
  data: ProviderData;
};

const CopyApplianceTemplateSection: FC<CopyApplianceTemplateSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const { isFeatureEnabled } = useFeatureFlags();
  const { permissions, provider } = data;
  const namespace = getNamespace(provider);
  const providerType = getType(provider);
  const templateName = getCopyApplianceTemplateName(provider);
  const copyApplianceTemplateEnabled = isFeatureEnabled(FEATURE_NAMES.COPY_APPLIANCE);

  // List watch: a single-name watch never leaves loading when the CR is missing.
  const [templates, loaded, loadError] = useK8sWatchResource<V1beta1CopyApplianceTemplate[]>(
    copyApplianceTemplateEnabled && providerType === PROVIDER_TYPES.vsphere && namespace
      ? {
          groupVersionKind: CopyApplianceTemplateModelGroupVersionKind,
          isList: true,
          namespace,
          namespaced: true,
        }
      : null,
  );

  if (
    !copyApplianceTemplateEnabled ||
    providerType !== PROVIDER_TYPES.vsphere ||
    !provider ||
    !permissions
  ) {
    return null;
  }

  const templateExists =
    loaded &&
    Boolean(templateName) &&
    (Array.isArray(templates) ? templates : []).some(
      (item) => item.metadata?.name === templateName,
    );

  return (
    <PageSection className="forklift-page-section" hasBodyWrapper={false}>
      <SectionHeading text={t('Copy appliance template')} />
      <CopyApplianceTemplateSectionBody
        canPatch={permissions.canPatch}
        loaded={loaded}
        loadError={loadError}
        onCreate={() => {
          launchOverlay(CreateCopyApplianceTemplateModal, {
            provider,
          });
        }}
        provider={provider}
        templateExists={templateExists}
      />
    </PageSection>
  );
};

export default CopyApplianceTemplateSection;
