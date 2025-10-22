import type { FC, ReactNode } from 'react';
import Linkify from 'react-linkify';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModelRef } from '@kubev2v/types';
import { Button, ButtonVariant, Content, ContentVariants, Popover } from '@patternfly/react-core';

import type { CellProps } from './CellProps';

export const ErrorStatusCell: FC<CellProps & { children: ReactNode; phaseLabel: string }> = ({
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
    <Content>
      <Content component={ContentVariants.p}>
        {t(
          `To troubleshoot, view the storage map details page
          and check the Forklift controller pod logs.`,
        )}
      </Content>
      <Content component={ContentVariants.p}>
        <Link to={StorageMapURL}>{t('View storage map details')}</Link>
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
