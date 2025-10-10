import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import SmartLinkify from '@components/common/SmartLinkify.tsx';
import { ProviderModelRef } from '@kubev2v/types';
import { Button, ButtonVariant, Content, ContentVariants, Popover } from '@patternfly/react-core';

import type { CellProps } from './CellProps.tsx';

export const ErrorStatusCell: FC<CellProps & { children: ReactNode; phaseLabel: string }> = ({
  children,
  data,
  phaseLabel,
}) => {
  const { t } = useForkliftTranslation();
  const { provider } = data;
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
    <Content>
      <Content component={ContentVariants.p}>{t(`The provider is not ready.`)}</Content>
      <Content component={ContentVariants.p}>
        {t(
          `To troubleshoot, view the provider status available in the provider details page
          and check the Forklift controller pod logs.`,
        )}
      </Content>
      <Content component={ContentVariants.p}>
        <Link to={providerURL}>{t('View provider details')}</Link>
      </Content>
    </Content>
  );

  return (
    <Popover
      headerContent={phaseLabel}
      bodyContent={bodyContent && <SmartLinkify>{bodyContent}</SmartLinkify>}
      footerContent={footerContent}
    >
      <Button
        variant={ButtonVariant.link}
        isInline
        data-testid="popover-status-button-providers-list"
      >
        {children}
      </Button>
    </Popover>
  );
};
