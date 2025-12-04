import type { FC, ReactNode } from 'react';
import Linkify from 'react-linkify';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModelRef } from '@kubev2v/types';
import { Button, ButtonVariant, Content, ContentVariants, Popover } from '@patternfly/react-core';

import type { CellProps } from './CellProps';

export const ErrorStatusCell: FC<CellProps & { children: ReactNode; phaseLabel: string }> = ({
  children,
  data,
  phaseLabel,
}) => {
  const { t } = useForkliftTranslation();

  const { obj: networkMap } = data;
  const networkMapURL = getResourceUrl({
    name: networkMap?.metadata?.name,
    namespace: networkMap?.metadata?.namespace,
    reference: NetworkMapModelRef,
  });

  // Find the error message from the status conditions
  const bodyContent = networkMap?.status?.conditions?.find(
    (condition) => condition?.category === 'Critical',
  )?.message;

  // Set the footer content
  const footerContent = (
    <Content>
      <Content component={ContentVariants.p}>
        {t(
          `To troubleshoot, view the network map details page
          and check the Forklift controller pod logs.`,
        )}
      </Content>
      <Content component={ContentVariants.p}>
        <Link to={networkMapURL}>{t('View network map details')}</Link>
      </Content>
    </Content>
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
