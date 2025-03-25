import React from 'react';
import Linkify from 'react-linkify';
import { Link } from 'react-router-dom-v5-compat';
import { getPlanPhase } from 'src/modules/Plans/utils';
import { getResourceUrl, TableIconCell } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef } from '@kubev2v/types';
import { Button, Popover, Text, TextContent, TextVariants } from '@patternfly/react-core';

import { CellProps } from './CellProps';
import { PlanStatusIcon } from './PlanStatusIcon';

export const ErrorStatusCell: React.FC<CellProps> = ({ data }) => {
  const { t } = useForkliftTranslation();

  const { obj: plan } = data;
  const phase = getPlanPhase(data);
  const phaseLabel: string = phase;

  const planURL = getResourceUrl({
    reference: PlanModelRef,
    name: plan?.metadata?.name,
    namespace: plan?.metadata?.namespace,
  });

  // Find the error message from the status conditions
  const bodyContent = plan?.status?.conditions.find(
    (condition) => condition?.category === 'Critical' || condition?.category === 'Warn',
  )?.message;

  // Set the footer content
  const footerContent = (
    <TextContent>
      <Text component={TextVariants.p}>
        {t(
          `To troubleshoot, view the plan details page
            and check the Forklift controller pod logs.`,
        )}
      </Text>
      <Text component={TextVariants.p}>
        <Link to={planURL}>{t('View plan details')}</Link>
      </Text>
    </TextContent>
  );

  return (
    <Popover
      headerContent={phaseLabel}
      bodyContent={bodyContent && <Linkify>{bodyContent}</Linkify>}
      footerContent={footerContent}
    >
      <Button variant="link" isInline data-testid="popover-status-button-plan-list">
        <TableIconCell icon={<PlanStatusIcon phase={phase} />}>{phaseLabel}</TableIconCell>
      </Button>
    </Popover>
  );
};
