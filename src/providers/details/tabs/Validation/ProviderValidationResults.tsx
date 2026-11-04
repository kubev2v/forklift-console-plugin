import { type FC, useState } from 'react';
import { Link } from 'react-router';
import { DateTime } from 'luxon';
import { isEmpty } from 'src/utils/helpers';
import { useForkliftTranslation } from 'src/utils/i18n';
import { VirtualizationValidationModelGroupVersionKind } from 'src/virtualizationValidation/models';
import type { VirtualizationValidation } from 'src/virtualizationValidation/types';
import { getLatestConditionMessage } from 'src/virtualizationValidation/utils/getLatestConditionMessage';
import { isValidationActive } from 'src/virtualizationValidation/utils/isValidationActive';

import { ExpandableSection, Label, List, ListItem, Spinner, Title } from '@patternfly/react-core';
import { JobModelGroupVersionKind } from '@utils/crds/common/models';
import { getResourceUrl } from '@utils/getResourceUrl';

import ValidationCheckResultsTable from './ValidationCheckResultsTable';

type ProviderValidationResultsProps = { validation: VirtualizationValidation };

const formatTimestamp = (timestamp: string | undefined): string | undefined =>
  timestamp ? DateTime.fromISO(timestamp).toLocaleString(DateTime.DATETIME_SHORT) : undefined;

const getVerdictColor = (
  verdict: string | undefined,
): 'blue' | 'green' | 'grey' | 'orange' | 'red' => {
  switch (verdict) {
    case 'Valid':
      return 'green';
    case 'Invalid':
      return 'red';
    case 'Inconclusive':
    case 'ValidWithWarnings':
      return 'orange';
    case 'Unknown':
      return 'blue';
    case undefined:
      return 'grey';
    default:
      return 'grey';
  }
};

const ProviderValidationResults: FC<ProviderValidationResultsProps> = ({ validation }) => {
  const { t } = useForkliftTranslation();
  const [executionDetailsExpanded, setExecutionDetailsExpanded] = useState(false);
  const validationActive = isValidationActive(validation);
  const name = validation.metadata?.name;
  const namespace = validation.metadata?.namespace;
  const artifact = validation.status?.artifact;
  const executions = validation.status?.executions ?? [];
  const jobName = validation.status?.jobName;
  const phase = validation.status?.phase ?? t('Pending');
  const verdict = validation.status?.verdict;
  const totalExecutions =
    validation.status?.reduction?.totalExecutions ??
    validation.status?.summary?.total ??
    executions.length;
  const validationURL = getResourceUrl({
    groupVersionKind: VirtualizationValidationModelGroupVersionKind,
    name,
    namespace,
  });
  const jobURL = getResourceUrl({
    groupVersionKind: JobModelGroupVersionKind,
    name: jobName,
    namespace,
  });
  const artifactURL = getResourceUrl({
    groupVersionKind: { kind: 'ConfigMap', version: 'v1' },
    name: artifact?.name,
    namespace: artifact?.namespace ?? namespace,
  });
  const createdAt = formatTimestamp(validation.metadata?.creationTimestamp);
  const startedAt = formatTimestamp(validation.status?.startedAt);
  const completedAt = formatTimestamp(validation.status?.completedAt);
  const conditionMessage = getLatestConditionMessage(validation);

  return (
    <section>
      <Title headingLevel="h2" size="lg">
        {validationActive ? t('Validation in progress') : t('Validation result')}
      </Title>
      <p>
        <Label color={validationActive ? 'blue' : getVerdictColor(verdict)} isCompact>
          {validationActive ? phase : (verdict ?? phase)}
        </Label>{' '}
        {name && <Link to={validationURL}>{name}</Link>}
        {name && ' · '}
        {name && <Link to={`${validationURL}/yaml`}>{t('View YAML')}</Link>}
      </p>
      {(conditionMessage !== undefined || validationActive) && (
        <p>{conditionMessage ?? t('Validation is in progress.')}</p>
      )}
      {validationActive && isEmpty(executions) && <Spinner aria-label={t('Starting validation')} />}
      {(jobName ?? artifact?.name) && (
        <p>
          {jobName && <Link to={jobURL}>{t('Validation Job')}</Link>}
          {jobName && artifact?.name && ' · '}
          {artifact?.name && <Link to={artifactURL}>{t('Report ConfigMap')}</Link>}
        </p>
      )}
      <p>
        {t('{{passed}} passed, {{failed}} failed, {{pending}} pending, {{total}} total', {
          failed: validation.status?.summary?.failed ?? 0,
          passed: validation.status?.summary?.passed ?? 0,
          pending: validation.status?.summary?.pending ?? 0,
          total: validation.status?.summary?.total ?? 0,
        })}
      </p>
      {!isEmpty(executions) && <ValidationCheckResultsTable executions={executions} />}
      {totalExecutions > executions.length && (
        <p>
          {t('Showing {{shown}} of {{total}} execution details.', {
            shown: executions.length,
            total: totalExecutions,
          })}
        </p>
      )}
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
          <strong>{t('Validation profile')}:</strong> {validation.spec?.run?.profile ?? '—'}
        </p>
        <p>
          <strong>{t('Remote validation namespace')}:</strong>{' '}
          {validation.spec?.workload?.namespace ?? t('Not available')}
        </p>
      </ExpandableSection>
    </section>
  );
};

export default ProviderValidationResults;
