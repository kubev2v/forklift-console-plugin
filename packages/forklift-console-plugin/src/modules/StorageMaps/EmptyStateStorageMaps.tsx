import React from 'react';
import { useHistory } from 'react-router';
import { AddMappingButton } from 'src/components/mappings/MappingPage';
import { useTranslation } from 'src/utils/i18n';

import RedHatProgressionIcon from '@kubev2v/common/components/RedHatProgressionIcon';
import { PROVIDERS_REFERENCE } from '@kubev2v/legacy/common/constants';
import { useHasSufficientProvidersQuery } from '@kubev2v/legacy/queries';
import { createK8sPath } from '@kubev2v/legacy/queries/helpers';
import { MappingType } from '@kubev2v/legacy/queries/types';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Text,
  TextContent,
  Title,
} from '@patternfly/react-core';

const EmptyStatePlans: React.FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useTranslation();
  const history = useHistory();

  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const { hasSufficientProviders } = sufficientProvidersQuery;

  return (
    <EmptyState variant={EmptyStateVariant.large} isFullHeight>
      <EmptyStateIcon icon={RedHatProgressionIcon} />

      <Title headingLevel="h4" size="lg">
        {t('No storage mappings have been defined.')}
      </Title>

      <EmptyStateBody style={{ textAlign: 'left' }}>
        <Bullseye>
          <TextContent>
            {!hasSufficientProviders && (
              <Text>
                {t(
                  'At least one source and one target provider must be available in order to create a mapping.',
                )}
              </Text>
            )}
          </TextContent>
        </Bullseye>
      </EmptyStateBody>

      {hasSufficientProviders && (
        <AddMappingButton
          namespace={namespace}
          mappingType={MappingType.Storage}
          label={t('Create StorageMap')}
        />
      )}

      {!hasSufficientProviders && (
        <EmptyStateSecondaryActions>
          <Button
            variant="link"
            onClick={() => history.push(createK8sPath(PROVIDERS_REFERENCE, namespace))}
          >
            {t('Go to providers')}
          </Button>
        </EmptyStateSecondaryActions>
      )}
    </EmptyState>
  );
};

export default EmptyStatePlans;
