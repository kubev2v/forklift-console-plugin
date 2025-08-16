import type { FC, ReactNode } from 'react';
import Linkify from 'react-linkify';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceFieldValue } from 'src/components/common/FilterGroup/matchers';
import { TableIconCell } from 'src/modules/Providers/utils/components/TableCell/TableIconCell';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useStatusPhaseValues } from 'src/modules/utils/useStatusPhaseValues.tsx';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModelRef } from '@kubev2v/types';
import {
  Button,
  ButtonVariant,
  Popover,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';

import type { CellProps } from './CellProps';

const ErrorStatusCell: FC<CellProps & { children: ReactNode; phaseLabel: string }> = ({
  children,
  data,
  phaseLabel,
}) => {
  const { t } = useForkliftTranslation();
  const { obj: storageMap } = data;
  const StorageMapURL = getResourceUrl({
    name: storageMap?.metadata?.name,
    namespace: storageMap?.metadata?.namespace,
    reference: StorageMapModelRef,
  });

  // Find the error message from the status conditions
  const bodyContent = storageMap?.status?.conditions?.find(
    (condition) => condition?.category === 'Critical',
  )?.message;

  // Set the footer content
  const footerContent = (
    <TextContent>
      <Text component={TextVariants.p}>
        {t(
          `To troubleshoot, view the storage map details page
          and check the Forklift controller pod logs.`,
        )}
      </Text>
      <Text component={TextVariants.p}>
        <Link to={StorageMapURL}>{t('View storage map details')}</Link>
      </Text>
    </TextContent>
  );

  return (
    <Popover
      headerContent={phaseLabel}
      bodyContent={bodyContent && <Linkify>{bodyContent}</Linkify>}
      footerContent={footerContent}
    >
      <Button
        variant={ButtonVariant.link}
        isInline
        data-testid="popover-status-button-network-maps-list"
      >
        {children}
      </Button>
    </Popover>
  );
};

export const StatusCell: FC<CellProps> = ({ data, fieldId, fields }) => {
  const phase = getResourceFieldValue(data, 'phase', fields);
  const { phaseIcon, phaseLabel } = useStatusPhaseValues(phase);

  const tableCellIcon = <TableIconCell icon={phaseIcon}>{phaseLabel}</TableIconCell>;

  if (phase === 'Critical') {
    return (
      <ErrorStatusCell data={data} fieldId={fieldId} fields={fields} phaseLabel={phaseLabel}>
        {tableCellIcon}
      </ErrorStatusCell>
    );
  }

  return tableCellIcon;
};
