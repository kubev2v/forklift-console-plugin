import { type FC, useMemo, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Flex, FlexItem } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon, PencilAltIcon as Pencil } from '@patternfly/react-icons';
import { getName, getNamespace } from '@utils/crds/common/selectors';

import { getCredentialsViewModeByType } from './utils/getCredentialsViewModeByType';

import './CredentialsSectionEditViewModes.style.scss';

type CredentialsSectionViewModeProps = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
  toggleEdit: () => void;
};

const CredentialsSectionViewMode: FC<CredentialsSectionViewModeProps> = ({
  provider,
  secret,
  toggleEdit,
}) => {
  const { t } = useForkliftTranslation();
  const [reveal, setReveal] = useState(false);

  const [canPatch] = useAccessReview({
    group: '',
    name: getName(secret),
    namespace: getNamespace(secret),
    resource: 'secrets',
    verb: 'patch',
  });

  const CredentialsViewModeByType = useMemo(
    () => getCredentialsViewModeByType(provider),
    [provider],
  );

  const toggleReveal = () => {
    setReveal((isReveal) => !isReveal);
  };

  return (
    <>
      <Flex>
        {canPatch && (
          <FlexItem>
            <Button variant={ButtonVariant.secondary} icon={<Pencil />} onClick={toggleEdit}>
              {t('Edit credentials')}
            </Button>
          </FlexItem>
        )}
        <FlexItem align={{ default: 'alignRight' }}>
          <Button
            variant={ButtonVariant.link}
            icon={reveal ? <EyeSlashIcon /> : <EyeIcon />}
            onClick={toggleReveal}
          >
            {reveal ? t('Hide values') : t('Reveal values')}
          </Button>
        </FlexItem>
      </Flex>

      {CredentialsViewModeByType && <CredentialsViewModeByType secret={secret} reveal={reveal} />}
    </>
  );
};

export default CredentialsSectionViewMode;
