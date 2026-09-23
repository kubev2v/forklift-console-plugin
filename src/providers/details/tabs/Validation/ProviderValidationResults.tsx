import { type FC, useState } from 'react';
import { Link } from 'react-router';
import { DateTime } from 'luxon';
import { isEmpty } from 'src/utils/helpers';
import { useForkliftTranslation } from 'src/utils/i18n';
import { VirtualizationValidationModelGroupVersionKind } from 'src/virtualizationValidation/models';
import type { VirtualizationValidation } from 'src/virtualizationValidation/types';
import { getLatestConditionMessage } from 'src/virtualizationValidation/utils/getLatestConditionMessage';
import { isValidationActive } from 'src/virtualizationValidation/utils/isValidationActive';

import { ExpandableSection, Label, List, ListItem, Title } from '@patternfly/react-core';
import { JobModelGroupVersionKind } from '@utils/crds/common/models';
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

const formatTimestamp = (timestamp: string | undefined): string | undefined =>
  timestamp ? DateTime.fromISO(timestamp).toLocaleString(DateTime.DATETIME_SHORT) : undefined;

const ProviderValidationResults: FC<ProviderValidationResultsProps> = ({ latest }) => {
  const { t } = useForkliftTranslation();
  const validationActive = isValidationActive(latest);
  const [executionDetailsExpanded, setExecutionDetailsExpanded] = useState(false);
  const name = latest.metadata?.name;
  const namespace = latest.metadata?.namespace;
  const validationURL = getResourceUrl({
    groupVersionKind: VirtualizationValidationModelGroupVersionKind,
    name,
    namespace,
  });
  const workloadNamespace = latest.spec?.validationNamespace;
  const checks = latest.status?.checkResults ?? [];
  const jobRef = latest.status?.jobRef;
  const resultRef = latest.status?.resultRef;
  const jobURL = getResourceUrl({
    groupVersionKind: JobModelGroupVersionKind,
    name: jobRef?.name,
    namespace: jobRef?.namespace ?? namespace,
  });
  const resultURL = getResourceUrl({
    groupVersionKind: { kind: 'ConfigMap', version: 'v1' },
    name: resultRef?.name,
    namespace: resultRef?.namespace ?? namespace,
  });
  const createdAt = formatTimestamp(latest.metadata?.creationTimestamp);
  const startedAt = formatTimestamp(latest.status?.startedAt);
  const completedAt = formatTimestamp(latest.status?.completedAt);
  const workloadSelected = latest.spec?.checks?.includes('workload');

  return (
    <section>
      <Title headingLevel="h2" size="lg">
        {validationActive ? t('Active validation') : t('Latest validation')}
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
      {(jobRef?.name ?? resultRef?.name) && (
        <p>
          {jobRef?.name && <Link to={jobURL}>{t('Validation Job')}</Link>}
          {jobRef?.name && resultRef?.name && ' · '}
          {resultRef?.name && <Link to={resultURL}>{t('Report ConfigMap')}</Link>}
        </p>
      )}
      <p>
        {t('{{passed}} passed, {{failed}} failed, {{pending}} pending, {{total}} total', {
          failed: latest.status?.summary?.failed ?? 0,
          passed: latest.status?.summary?.passed ?? 0,
          pending: latest.status?.summary?.pending ?? 0,
          total: latest.status?.summary?.total ?? 0,
        })}
      </p>
      {!isEmpty(checks) && <ValidationCheckResultsTable checks={checks} />}
      <ExpandableSection
        isExpanded={validationActive || executionDetailsExpanded}
        onToggle={(_event, expanded) => {
          setExecutionDetailsExpanded(expanded);
        }}
        toggleText={t('Execution details')}
      >
        <List component="ol" isPlain>
          {createdAt && (
            <ListItem>
              {t('Validation requested: {{timestamp}}', { timestamp: createdAt })}
            </ListItem>
          )}
          {startedAt && (
            <ListItem>
              {t('Validator Job started: {{timestamp}}', { timestamp: startedAt })}
            </ListItem>
          )}
          {validationActive && <ListItem>{t('Partial results are being published')}</ListItem>}
          {completedAt && (
            <ListItem>
              {t('Validation completed: {{timestamp}}', { timestamp: completedAt })}
            </ListItem>
          )}
        </List>
        <p>
          <strong>{t('Validation namespace')}:</strong>{' '}
          {workloadNamespace ?? t('Not used for this validation')}
        </p>
        {workloadSelected && (
          <p>
            <strong>{t('Temporary workload cleanup')}:</strong>{' '}
            {t('Temporary VM resources are removed when the validation completes.')}
          </p>
        )}
      </ExpandableSection>
    </section>
  );
};

export default ProviderValidationResults;
