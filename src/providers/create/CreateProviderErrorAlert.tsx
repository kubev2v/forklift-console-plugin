import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from './fields/constants';
import { Ec2TargetResolutionError } from './utils/ec2TargetResolutionError';
import type { CreateProviderFormData } from './types';

type CreateProviderErrorAlertProps = {
  apiError: Error;
};

const CreateProviderErrorAlert: FC<CreateProviderErrorAlertProps> = ({ apiError }) => {
  const { t } = useForkliftTranslation();
  const { setValue, unregister } = useFormContext<CreateProviderFormData>();

  const isTargetResolutionError = apiError instanceof Ec2TargetResolutionError;

  const handleEnterTargetSettingsManually = (): void => {
    setValue(ProviderFormFieldId.Ec2AutoTargetCredentials, false);
    unregister([ProviderFormFieldId.Ec2TargetAz, ProviderFormFieldId.Ec2TargetRegion]);
    // The AZ input only mounts on the next commit, so focus after it is rendered.
    requestAnimationFrame(() => {
      document.getElementById(ProviderFormFieldId.Ec2TargetAz)?.focus();
    });
  };

  return (
    <Alert
      actionLinks={
        isTargetResolutionError ? (
          <Button isInline onClick={handleEnterTargetSettingsManually} variant={ButtonVariant.link}>
            {t('Enter target settings manually')}
          </Button>
        ) : undefined
      }
      className="pf-v6-u-mt-md"
      isInline
      title={
        isTargetResolutionError
          ? t('Could not auto-detect target settings')
          : t('Error creating provider')
      }
      variant={AlertVariant.danger}
    >
      {apiError.message}
    </Alert>
  );
};

export default CreateProviderErrorAlert;
