import React from 'react';
import Linkify from 'react-linkify';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceUrl, TableIconCell } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { getResourceFieldValue } from '@kubev2v/common';
import { NetworkMapModelRef } from '@kubev2v/types';
import { Button, Popover, Spinner, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';

import { CellProps } from './CellProps';

export const StatusCell: React.FC<CellProps> = ({ data, fields, fieldId }) => {
  const { t } = useForkliftTranslation();

  const phase = getResourceFieldValue(data, 'phase', fields);
  const phaseLabel = phaseLabels[phase] ? t(phaseLabels[phase]) : t('Undefined');

  switch (phase) {
    case 'Critical':
      return ErrorStatusCell({
        t,
        data,
        fields,
        fieldId,
      });
    default:
      return <TableIconCell icon={statusIcons[phase]}>{phaseLabel}</TableIconCell>;
  }
};

export const ErrorStatusCell: React.FC<CellProps & { t }> = ({ t, data, fields }) => {
  const { obj: networkMap } = data;
  const phase = getResourceFieldValue(data, 'phase', fields);
  const phaseLabel = phaseLabels[phase] ? t(phaseLabels[phase]) : t('Undefined');
  const networkMapURL = getResourceUrl({
    reference: NetworkMapModelRef,
    name: networkMap?.metadata?.name,
    namespace: networkMap?.metadata?.namespace,
  });

  // Find the error message from the status conditions
  const bodyContent = networkMap?.status?.conditions.find(
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
        <Link to={networkMapURL}>{t('View network map details')}</Link>
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
  Ready: <CheckCircleIcon color="#3E8635" />,
  'Not Ready': <Spinner size="sm" />,
  Critical: <ExclamationCircleIcon color="#C9190B" />,
};

const phaseLabels = {
  // t('Ready')
  Ready: 'Ready',
  // t('Not Ready')
  'Not Ready': 'Not Ready',
  // t('Critical')
  Critical: 'Critical',
};
