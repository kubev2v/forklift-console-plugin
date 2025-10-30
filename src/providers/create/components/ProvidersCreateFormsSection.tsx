import { type FC, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom-v5-compat';
import { encode } from 'js-base64';
import SectionHeading from 'src/components/headers/SectionHeading';
import { providerSpecTemplate } from 'src/providers/create/utils/providerTemplates';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProjectNameSelect } from '@components/common/ProjectNameSelect';
import { Form } from '@patternfly/react-core';
import { getType } from '@utils/crds/common/selectors';

import type { ProvidersCreateFormsSectionProps } from '../utils/types';

import ProviderAndSecretCreateFieldsSection from './ProviderAndSecretCreateFieldsSection';
import ProviderCardsSelect from './ProviderCardsSelect';
import ProviderResourceNameEditItem from './ProviderResourceNameEditItem';

const ProvidersCreateFormsSection: FC<ProvidersCreateFormsSectionProps> = ({
  newProvider,
  newSecret,
  onNewProviderChange,
  onNewSecretChange,
  onProjectNameChange,
  projectName,
  providerNames = [],
  providerNamesLoaded,
}) => {
  const { t } = useForkliftTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const providerType = searchParams.get('providerType');

  const updateProviderType = useCallback(
    (type: string | null) => {
      const updatedProvider = {
        ...newProvider,
        spec: { ...(newProvider?.spec ?? providerSpecTemplate), type: type ?? '' },
      };
      onNewProviderChange(updatedProvider);
    },
    [newProvider, onNewProviderChange],
  );

  useEffect(() => {
    if (!providerNamesLoaded) {
      return;
    }

    if (providerType && providerType !== getType(newProvider)) {
      updateProviderType(providerType);
      searchParams.delete('providerType');
      navigate({ search: searchParams.toString() }, { replace: true });
    }
  }, [
    providerType,
    newProvider,
    providerNamesLoaded,
    onNewProviderChange,
    searchParams,
    navigate,
    updateProviderType,
  ]);

  const handleProviderTypeChange = (type: string | null) => {
    // default auth type for openstack (if not defined)
    if (type === PROVIDER_TYPES.openstack && !newSecret?.data?.authType) {
      onNewSecretChange({
        ...newSecret,
        data: { ...newSecret.data, authType: encode('applicationcredential') },
      });
    }

    updateProviderType(type);
  };

  return (
    <>
      <SectionHeading text={t('Provider details')} />

      <Form isWidthLimited className="forklift-create-form-details-section">
        <ProjectNameSelect projectName={projectName} onSelect={onProjectNameChange} />

        <ProviderCardsSelect
          newProvider={newProvider}
          handleProviderTypeChange={handleProviderTypeChange}
        />

        <ProviderResourceNameEditItem
          newProvider={newProvider}
          providerNames={providerNames}
          onNewProviderChange={onNewProviderChange}
        />

        <ProviderAndSecretCreateFieldsSection
          newProvider={newProvider}
          newSecret={newSecret}
          onNewProviderChange={onNewProviderChange}
          onNewSecretChange={onNewSecretChange}
        />
      </Form>
    </>
  );
};

export default ProvidersCreateFormsSection;
