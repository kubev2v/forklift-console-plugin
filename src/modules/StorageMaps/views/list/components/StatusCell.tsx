import React from 'react';
import Linkify from 'react-linkify';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { getResourceUrl, TableIconCell } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModelRef } from '@kubev2v/types';
import { Button, Popover, Spinner, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';

import type { CellProps } from './CellProps';

export const StatusCell: React.FC<CellProps> = ({ data, fieldId, fields }) => {
  const { t } = useForkliftTranslation();

  const phase = getResourceFieldValue(data, 'phase', fields);
  const phaseLabel = phaseLabels[phase] ? t(phaseLabels[phase]) : t('Undefined');

  switch (phase) {
    case 'Critical':
      return ErrorStatusCell({
        data,
        fieldId,
        fields,
        t,
      });
    default:
      return <TableIconCell icon={statusIcons[phase]}>{phaseLabel}</TableIconCell>;
  }
};

export const ErrorStatusCell: React.FC<CellProps & { t }> = ({ data, fields, t }) => {
  const { obj: StorageMap } = data;
  const phase = getResourceFieldValue(data, 'phase', fields);
  const phaseLabel = phaseLabels[phase] ? t(phaseLabels[phase]) : t('Undefined');
  const StorageMapURL = getResourceUrl({
    name: StorageMap?.metadata?.name,
    namespace: StorageMap?.metadata?.namespace,
    reference: StorageMapModelRef,
  });

  // Find the error message from the status conditions
  const bodyContent = StorageMap?.status?.conditions.find(
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

const statusIcons = {
  Critical: <ExclamationCircleIcon color="#C9190B" />,
  'Not Ready': <Spinner size="sm" />,
  Ready: <CheckCircleIcon color="#3E8635" />,
};

const phaseLabels = {
  // t('Critical')
  Critical: 'Critical',
  // t('Not Ready')
  'Not Ready': 'Not Ready',
  // t('Ready')
  Ready: 'Ready',
};
