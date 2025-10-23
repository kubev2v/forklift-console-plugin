import type { FC } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import { Alert, AlertVariant, HelperText, HelperTextItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type ProvidersCreatePageHeaderProps = {
  apiError: Error | null | undefined;
};

const ProvidersCreatePageHeader: FC<ProvidersCreatePageHeaderProps> = ({ apiError }) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <SectionHeading
        text={
          <>
            {t('Create provider')}

            <HelperText className="pf-v6-u-mt-sm">
              <HelperTextItem variant="default">
                {t(
                  'Create providers by using the form below. Providers CRs store attributes that enable MTV to connect to and interact with the source and target providers.',
                )}
              </HelperTextItem>
            </HelperText>
          </>
        }
      />

      {apiError && (
        <Alert
          className="co-alert co-alert--margin-top"
          isInline
          variant={AlertVariant.danger}
          title={t('Error')}
        >
          {apiError?.message || apiError?.toString()}
        </Alert>
      )}
    </>
  );
};

export default ProvidersCreatePageHeader;
