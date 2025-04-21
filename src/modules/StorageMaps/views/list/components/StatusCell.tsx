import type { FC } from 'react';
import Linkify from 'react-linkify';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableIconCell } from 'src/modules/Providers/utils/components/TableCell/TableIconCell';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModelRef } from '@kubev2v/types';
import { Button, Popover, Spinner, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { t } from '@utils/i18n';

import type { CellProps } from './CellProps';

type Phase = 'Critical' | 'Not Ready' | 'Ready';

const statusIcons = {
  Critical: <ExclamationCircleIcon color="#C9190B" />,
  'Not Ready': <Spinner size="sm" />,
  Ready: <CheckCircleIcon color="#3E8635" />,
};

const phaseLabels = {
  Critical: t('Critical'),
  'Not Ready': t('Not Ready'),
  Ready: t('Ready'),
};

export const StatusCell: FC<CellProps> = ({ data, fieldId, fields }) => {
  const { t } = useForkliftTranslation();

  const phase = getResourceFieldValue(data, 'phase', fields) as Phase;
  const phaseLabel = phaseLabels[phase] ? t(phaseLabels[phase]) : t('Undefined');

  switch (phase) {
    case 'Critical':
      return <ErrorStatusCell data={data} fieldId={fieldId} fields={fields} />;
    case 'Not Ready':
    case 'Ready':
    default:
      return <TableIconCell icon={statusIcons[phase]}>{phaseLabel}</TableIconCell>;
  }
};

const ErrorStatusCell: FC<CellProps> = ({ data, fields }) => {
  const { t } = useForkliftTranslation();
  const { obj: StorageMap } = data;
  const phase = getResourceFieldValue(data, 'phase', fields) as Phase;
  const phaseLabel = phaseLabels[phase] ? t(phaseLabels[phase]) : t('Undefined');
  const StorageMapURL = getResourceUrl({
    name: StorageMap?.metadata?.name,
    namespace: StorageMap?.metadata?.namespace,
    reference: StorageMapModelRef,
  });

  // Find the error message from the status conditions
  const bodyContent = StorageMap?.status?.conditions?.find(
    (condition) => condition?.category === 'Critical',
  )?.message;

  // Set the footer content
  const footerContent = (
    <TextContent>
      <Text component={TextVariants.p}>
        {t(
          `To troubleshoot, view the network map details page
          and check the Forklift controller pod logs.`,
        )}
      </Text>
      <Text component={TextVariants.p}>
        <Link to={StorageMapURL}>{t('View network map details')}</Link>
      </Text>
    </TextContent>
  );

  return (
    <Popover
      headerContent={phaseLabel}
      bodyContent={bodyContent && <Linkify>{bodyContent}</Linkify>}
      footerContent={footerContent}
    >
      <Button variant="link" isInline data-testid="popover-status-button-network-maps-list">
        <TableIconCell icon={statusIcons[phase]}>{phaseLabel}</TableIconCell>
      </Button>
    </Popover>
  );
};
