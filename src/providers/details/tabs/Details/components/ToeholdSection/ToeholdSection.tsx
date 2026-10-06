import type { FC, ReactNode } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
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
import { ToeholdTemplateModelGroupVersionKind } from '@utils/crds/common/models';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { useFeatureFlags } from '@utils/hooks/useFeatureFlags';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import type { ProviderData } from '@utils/providers/types';

import CreateToeholdTemplateModal, {
  type CreateToeholdTemplateModalProps,
} from '../DetailsSection/CreateToeholdTemplateModal';
import ToeholdSettingDetailsItem from '../DetailsSection/ToeholdSettingDetailsItem';
import ToeholdSSHSecretsDetailsItem from '../DetailsSection/ToeholdSSHSecretsDetailsItem';
import ToeholdTemplateDetailsItem from '../DetailsSection/ToeholdTemplateDetailsItem';

type ToeholdSectionProps = {
  data: ProviderData;
};

const ToeholdSection: FC<ToeholdSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();
  const { isFeatureEnabled } = useFeatureFlags();
  const { permissions, provider } = data;
  const name = getName(provider);
  const namespace = getNamespace(provider);
  const templateName = name ? `${name}-toehold` : undefined;
  const toeholdEnabled = isFeatureEnabled(FEATURE_NAMES.TOEHOLD);

  // List watch: a single-name watch never leaves loading when the CR is missing.
  const [templates, loaded, loadError] = useK8sWatchResource<K8sResourceCommon[]>(
    toeholdEnabled && provider?.spec?.type === PROVIDER_TYPES.vsphere && namespace
      ? {
          groupVersionKind: ToeholdTemplateModelGroupVersionKind,
          isList: true,
          namespace,
          namespaced: true,
        }
      : null,
  );

  if (
    !toeholdEnabled ||
    provider?.spec?.type !== PROVIDER_TYPES.vsphere ||
    !provider ||
    !permissions
  ) {
    return null;
  }

  const templateExists =
    loaded &&
    Boolean(templateName) &&
    (Array.isArray(templates) ? templates : []).some((item) => getName(item) === templateName);

  const stillLoading = !loaded && !loadError;

  let body: ReactNode = (
    <EmptyState
      headingLevel="h4"
      icon={PlusCircleIcon}
      titleText={t('No ToeholdTemplate')}
      variant={EmptyStateVariant.sm}
    >
      <EmptyStateBody>
        {t(
          'Create a ToeholdTemplate to place the copy-appliance template on this vSphere provider. Datastore, folder, network, and resource pool are required.',
        )}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            isDisabled={!permissions.canPatch}
            onClick={() => {
              launchOverlay<CreateToeholdTemplateModalProps>(CreateToeholdTemplateModal, {
                provider,
              });
            }}
            variant={ButtonVariant.primary}
          >
            {t('Create ToeholdTemplate')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );

  if (stillLoading) {
    body = <Spinner size="lg" />;
  } else if (templateExists) {
    body = (
      <>
        <DescriptionList
          columnModifier={{
            default: '2Col',
          }}
        >
          <ToeholdSettingDetailsItem
            canPatch={permissions.canPatch}
            field="datastore"
            resource={provider}
          />
          <ToeholdSettingDetailsItem
            canPatch={permissions.canPatch}
            field="folder"
            resource={provider}
          />
          <ToeholdSettingDetailsItem
            canPatch={permissions.canPatch}
            field="network"
            resource={provider}
          />
          <ToeholdSettingDetailsItem
            canPatch={permissions.canPatch}
            field="resourcePool"
            resource={provider}
          />
        </DescriptionList>
        <DescriptionList>
          <ToeholdTemplateDetailsItem resource={provider} />
          <ToeholdSSHSecretsDetailsItem resource={provider} />
        </DescriptionList>
      </>
    );
  }

  return (
    <PageSection className="forklift-page-section" hasBodyWrapper={false}>
      <SectionHeading text={t('Toehold')} />
      {body}
    </PageSection>
  );
};

export default ToeholdSection;
