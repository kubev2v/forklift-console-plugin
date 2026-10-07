import type { FC } from 'react';

import { ErrorState } from '@components/common/Page/PageStates';
import type { V1beta1Provider } from '@forklift-ui/types';
import {
  Button,
  ButtonVariant,
  DescriptionList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Spinner,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import { COPY_APPLIANCE_SETTING_FIELDS } from '../DetailsSection/copyAppliancePlacementConfig';
import CopyApplianceSettingDetailsItem from '../DetailsSection/CopyApplianceSettingDetailsItem';
import CopyApplianceSSHSecretsDetailsItem from '../DetailsSection/CopyApplianceSSHSecretsDetailsItem';
import CopyApplianceTemplateDetailsItem from '../DetailsSection/CopyApplianceTemplateDetailsItem';

type CopyApplianceTemplateSectionBodyProps = {
  canPatch: boolean;
  loaded: boolean;
  loadError: unknown;
  onCreate: () => void;
  provider: V1beta1Provider;
  templateExists: boolean;
};

const CopyApplianceTemplateSectionBody: FC<CopyApplianceTemplateSectionBodyProps> = ({
  canPatch,
  loaded,
  loadError,
  onCreate,
  provider,
  templateExists,
}) => {
  const { t } = useForkliftTranslation();

  if (!loaded && !loadError) {
    return <Spinner size="lg" />;
  }
  if (loadError) {
    return <ErrorState title={t('Unable to load CopyApplianceTemplate')} />;
  }
  if (templateExists) {
    return (
      <>
        <DescriptionList
          columnModifier={{
            default: '2Col',
          }}
        >
          {COPY_APPLIANCE_SETTING_FIELDS.map((field) => (
            <CopyApplianceSettingDetailsItem
              canPatch={canPatch}
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
  }

  return (
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
          <Button isDisabled={!canPatch} onClick={onCreate} variant={ButtonVariant.primary}>
            {t('Create CopyApplianceTemplate')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default CopyApplianceTemplateSectionBody;
