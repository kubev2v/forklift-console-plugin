import React from 'react';
import { TFunction } from 'react-i18next';
import Linkify from 'react-linkify';
import { Link } from 'react-router-dom';
import { getResourceUrl, TableIconCell } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { getResourceFieldValue } from '@kubev2v/common';
import { ProviderModelRef } from '@kubev2v/types';
import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Button, Popover, Spinner, Text, TextContent, TextVariants } from '@patternfly/react-core';

import { CellProps } from './CellProps';

/**
 * StatusCell component, used for displaying the status of a resource.
 * @param {CellProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export const StatusCell: React.FC<CellProps> = ({ data, fields, fieldId }) => {
  const { t } = useForkliftTranslation();

  const phase = getResourceFieldValue(data, 'phase', fields);
  const phaseLabel = phaseLabels[phase] ? t(phaseLabels[phase]) : t('Undefined');

  switch (phase) {
    case 'ConnectionFailed':
    case 'ValidationFailed':
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

/**
 * A component that displays an error status cell with popover content.
 * @param {Object} props - The component props.
 * @param {Object} props.data - The data object for the cell.
 * @param {Object} props.fields - The fields object for the cell.
 * @returns {JSX.Element} The JSX element representing the error status cell.
 */
export const ErrorStatusCell: React.FC<CellProps & { t: TFunction }> = ({ t, data, fields }) => {
  const { provider } = data;
  const phase = getResourceFieldValue(data, 'phase', fields);
  const phaseLabel = phaseLabels[phase] ? t(phaseLabels[phase]) : t('Undefined');
  const providerURL = getResourceUrl({
    reference: ProviderModelRef,
    name: provider?.metadata?.name,
    namespace: provider?.metadata?.namespace,
  });

  // Find the error message from the status conditions
  const bodyContent = provider?.status?.conditions.find(
    (condition) => condition?.category === 'Critical',
  )?.message;

  // Set the footer content
  const footerContent = (
    <TextContent>
      <Text component={TextVariants.p}>{t(`The provider is not ready.`)}</Text>
      <Text component={TextVariants.p}>
        {t(
          `To troubleshoot, view the provider status available in the provider details page
          and check the Forklift controller pod logs.`,
        )}
      </Text>
      <Text component={TextVariants.p}>
        <Link to={providerURL}>{t('View provider details')}</Link>
      </Text>
    </TextContent>
  );

  return (
    <Popover
      headerContent={phaseLabel}
      bodyContent={bodyContent && <Linkify>{bodyContent}</Linkify>}
      footerContent={footerContent}
    >
      <Button variant="link" isInline data-test="popover-status-button">
        <TableIconCell icon={statusIcons[phase]}>{phaseLabel}</TableIconCell>
      </Button>
    </Popover>
  );
};

const statusIcons = {
  ValidationFailed: <RedExclamationCircleIcon />,
  ConnectionFailed: <RedExclamationCircleIcon />,
  Ready: <GreenCheckCircleIcon />,
  Staging: <Spinner size="sm" />,
};

const phaseLabels = {
  // t('Ready')
  Ready: 'Ready',
  // t('Connection Failed')
  ConnectionFailed: 'Connection Failed',
  // t('Validation Failed')
  ValidationFailed: 'Validation Failed',
  // t('Staging')
  Staging: 'Staging',
};
