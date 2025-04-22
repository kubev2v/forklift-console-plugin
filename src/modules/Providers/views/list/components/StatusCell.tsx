import type { FC } from 'react';
import Linkify from 'react-linkify';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableIconCell } from 'src/modules/Providers/utils/components/TableCell/TableIconCell';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelRef } from '@kubev2v/types';
import { Button, Popover, Spinner, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { CheckCircleIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { t } from '@utils/i18n';

import type { CellProps } from './CellProps';

type Phase = 'ConnectionFailed' | 'Ready' | 'Staging' | 'ValidationFailed';

const statusIcons = {
  ConnectionFailed: <ExclamationCircleIcon color="#C9190B" />,
  Ready: <CheckCircleIcon color="#3E8635" />,
  Staging: <Spinner size="sm" />,
  ValidationFailed: <ExclamationCircleIcon color="#C9190B" />,
};

const phaseLabels = {
  ConnectionFailed: t('Connection Failed'),
  Ready: t('Ready'),
  Staging: t('Staging'),
  ValidationFailed: t('Validation Failed'),
};

/**
 * StatusCell component, used for displaying the status of a resource.
 * @param {CellProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered component.
 */
export const StatusCell: FC<CellProps> = ({ data, fieldId, fields }) => {
  const { t } = useForkliftTranslation();

  const phase = getResourceFieldValue(data, 'phase', fields) as Phase;
  const phaseLabel = phaseLabels[phase] ? t(phaseLabels[phase]) : t('Undefined');

  switch (phase) {
    case 'ConnectionFailed':
    case 'ValidationFailed':
      return <ErrorStatusCell data={data} fieldId={fieldId} fields={fields} />;
    case 'Ready':
    case 'Staging':
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
const ErrorStatusCell: FC<CellProps> = ({ data, fields }) => {
  const { t } = useForkliftTranslation();
  const { provider } = data;
  const phase = getResourceFieldValue(data, 'phase', fields) as Phase;
  const phaseLabel = phaseLabels[phase] ? t(phaseLabels[phase]) : t('Undefined');
  const providerURL = getResourceUrl({
    name: provider?.metadata?.name,
    namespace: provider?.metadata?.namespace,
    reference: ProviderModelRef,
  });

  // Find the error message from the status conditions
  const bodyContent = provider?.status?.conditions?.find(
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
      <Button variant="link" isInline data-testid="popover-status-button-providers-list">
        <TableIconCell icon={statusIcons[phase]}>{phaseLabel}</TableIconCell>
      </Button>
    </Popover>
  );
};
