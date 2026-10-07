import type { FC, ReactNode } from 'react';

import { ErrorState } from '@components/common/Page/PageStates';
import SectionHeading from '@components/headers/SectionHeading';
import {
  CopyApplianceTemplateModelGroupVersionKind,
  type V1beta1CopyApplianceTemplate,
} from '@forklift-ui/types';
import { useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  DescriptionList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  PageSection,
  Spinner,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { FEATURE_NAMES } from '@utils/constants';
import { getNamespace, getType } from '@utils/crds/common/selectors';
import { getCopyApplianceTemplateName } from '@utils/crds/providers/selectors';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { ProviderData } from '@utils/providers/types';

import { COPY_APPLIANCE_SETTING_FIELDS } from '../DetailsSection/copyAppliancePlacementConfig';
import CopyApplianceSettingDetailsItem from '../DetailsSection/CopyApplianceSettingDetailsItem';
import CopyApplianceSSHSecretsDetailsItem from '../DetailsSection/CopyApplianceSSHSecretsDetailsItem';
import CopyApplianceTemplateDetailsItem from '../DetailsSection/CopyApplianceTemplateDetailsItem';
import CreateCopyApplianceTemplateModal from '../DetailsSection/CreateCopyApplianceTemplateModal';

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
  const copyApplianceTemplateEnabled = isFeatureEnabled(FEATURE_NAMES.COPY_APPLIANCE_TEMPLATE);

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

  let body: ReactNode;
  if (!loaded && !loadError) {
    body = <Spinner size="lg" />;
  } else if (loadError) {
    body = <ErrorState title={t('Unable to load CopyApplianceTemplate')} />;
  } else if (templateExists) {
    body = (
      <>
        <DescriptionList
          columnModifier={{
            default: '2Col',
          }}
        >
          {COPY_APPLIANCE_SETTING_FIELDS.map((field) => (
            <CopyApplianceSettingDetailsItem
              canPatch={permissions.canPatch}
              field={field}
              key={field}
              resource={provider}
            />
          ))}
        </DescriptionList>
        <DescriptionList>
          <CopyApplianceTemplateDetailsItem resource={provider} />
          <CopyApplianceSSHSecretsDetailsItem resource={provider} />
        </DescriptionList>
      </>
    );
  } else {
    body = (
      <EmptyState
        headingLevel="h4"
        icon={PlusCircleIcon}
        titleText={t('No CopyApplianceTemplate')}
        variant={EmptyStateVariant.sm}
      >
        <EmptyStateBody>
          {t(
            'Create a CopyApplianceTemplate to place the copy-appliance template on this vSphere provider. Datastore, folder, network, and resource pool are required.',
          )}
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button
              isDisabled={!permissions.canPatch}
              onClick={() => {
                launchOverlay(CreateCopyApplianceTemplateModal, {
                  provider,
                });
              }}
              variant={ButtonVariant.primary}
            >
              {t('Create CopyApplianceTemplate')}
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    );
  }

  return (
    <PageSection className="forklift-page-section" hasBodyWrapper={false}>
      <SectionHeading text={t('Copy appliance template')} />
      {body}
    </PageSection>
  );
};

export default CopyApplianceTemplateSection;
