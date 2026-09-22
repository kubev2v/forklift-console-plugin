import type { FC } from 'react';
import { Link } from 'react-router';
import { isEmpty } from 'src/utils/helpers';
import { useForkliftTranslation } from 'src/utils/i18n';
import { VirtualizationValidationModelGroupVersionKind } from 'src/virtualizationValidation/models';
import type { VirtualizationValidation } from 'src/virtualizationValidation/types';
import { getLatestConditionMessage } from 'src/virtualizationValidation/utils/getLatestConditionMessage';
import { isValidationActive } from 'src/virtualizationValidation/utils/isValidationActive';

import { Label, Title } from '@patternfly/react-core';
import { getResourceUrl } from '@utils/getResourceUrl';

import ValidationCheckResultsTable from './ValidationCheckResultsTable';

type ProviderValidationResultsProps = { latest: VirtualizationValidation };

const getLabelColor = (phase: string | undefined): 'blue' | 'green' | 'red' | 'grey' => {
  switch (phase) {
    case 'Succeeded':
      return 'green';
    case 'Failed':
      return 'red';
    case 'Pending':
    case 'Running':
      return 'blue';
    case undefined:
    default:
      return 'grey';
  }
};

const ProviderValidationResults: FC<ProviderValidationResultsProps> = ({ latest }) => {
  const { t } = useForkliftTranslation();
  const name = latest.metadata?.name;
  const namespace = latest.metadata?.namespace;
  const validationURL = getResourceUrl({
    groupVersionKind: VirtualizationValidationModelGroupVersionKind,
    name,
    namespace,
  });
  const workloadNamespace = latest.spec?.validationNamespace;
  const checks = latest.status?.checkResults ?? [];

  return (
    <section>
      <Title headingLevel="h2" size="lg">
        {isValidationActive(latest) ? t('Active validation') : t('Latest validation')}
      </Title>
      <p>
        <Label color={getLabelColor(latest.status?.phase)} isCompact>
          {latest.status?.phase ?? t('Pending')}
        </Label>{' '}
        {name && <Link to={validationURL}>{name}</Link>}
        {name && ' · '}
        {name && <Link to={`${validationURL}/yaml`}>{t('View YAML')}</Link>}
      </p>
      <p>{getLatestConditionMessage(latest) ?? t('Validation is in progress.')}</p>
      <p>
        <strong>{t('Remote validation namespace')}:</strong>{' '}
        {workloadNamespace ?? t('Not used for this validation')}
      </p>
      <p>
        {t('{{passed}} passed, {{failed}} failed, {{pending}} pending, {{total}} total', {
          failed: latest.status?.summary?.failed ?? 0,
          passed: latest.status?.summary?.passed ?? 0,
          pending: latest.status?.summary?.pending ?? 0,
          total: latest.status?.summary?.total ?? 0,
        })}
      </p>
      {!isEmpty(checks) && <ValidationCheckResultsTable checks={checks} />}
    </section>
  );
};

export default ProviderValidationResults;
