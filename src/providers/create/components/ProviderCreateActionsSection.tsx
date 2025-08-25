import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { type ValidationMsg, ValidationState } from 'src/providers/utils/types';

import { ProviderModelRef, type V1beta1Provider } from '@kubev2v/types';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { getType } from '@utils/crds/common/selectors';
import { useForkliftTranslation } from '@utils/i18n';

type ProviderCreateActionsSectionProps = {
  newProvider: V1beta1Provider;
  projectName: string;
  activeNamespace?: string | undefined;
  validationError: ValidationMsg;
  isLoading: boolean;
  onUpdate: () => void;
};

const ProviderCreateActionsSection: FC<ProviderCreateActionsSectionProps> = ({
  activeNamespace,
  isLoading,
  newProvider,
  onUpdate,
  projectName,
  validationError,
}) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const [, setActiveNamespace] = useActiveNamespace();

  const providersListURL = getResourceUrl({
    namespace: activeNamespace,
    reference: ProviderModelRef,
  });

  const onCancelClick = () => {
    navigate(providersListURL);
  };

  return (
    <>
      <Flex>
        <FlexItem>
          <Button
            data-testid="create-provider-button"
            variant={ButtonVariant.primary}
            isDisabled={validationError?.type === ValidationState.Error}
            isLoading={isLoading}
            onClick={() => {
              setActiveNamespace(projectName);
              onUpdate();
            }}
          >
            {t('Create provider')}
          </Button>
        </FlexItem>
        <FlexItem>
          <Button onClick={onCancelClick} variant={ButtonVariant.secondary}>
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>
      <HelperText className="forklift-create-subtitle-errors">
        {validationError?.type === ValidationState.Error && getType(newProvider) ? (
          <HelperTextItem variant="error">{validationError?.msg}</HelperTextItem>
        ) : (
          <HelperTextItem variant="indeterminate">{t('Create new provider')}</HelperTextItem>
        )}
      </HelperText>
    </>
  );
};

export default ProviderCreateActionsSection;
