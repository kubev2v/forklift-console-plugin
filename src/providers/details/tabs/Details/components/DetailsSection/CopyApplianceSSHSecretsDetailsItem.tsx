import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';
import {
  getCopyApplianceSSHPrivateSecret,
  getCopyApplianceSSHPublicSecret,
  getNamespace,
} from '@utils/crds/common/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { ProviderDetailsItemProps } from './utils/types';

const CopyApplianceSSHSecretsDetailsItem: FC<ProviderDetailsItemProps> = ({
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const namespace = getNamespace(provider);
  const privateSecret = getCopyApplianceSSHPrivateSecret(provider);
  const publicSecret = getCopyApplianceSSHPublicSecret(provider);

  return (
    <DetailsItem
      content={
        privateSecret && publicSecret && namespace ? (
          <Stack>
            <StackItem>
              <ResourceLink
                groupVersionKind={{ kind: 'Secret', version: 'v1' }}
                name={privateSecret}
                namespace={namespace}
              />
            </StackItem>
            <StackItem>
              <ResourceLink
                groupVersionKind={{ kind: 'Secret', version: 'v1' }}
                name={publicSecret}
                namespace={namespace}
              />
            </StackItem>
          </Stack>
        ) : (
          <span className="text-muted">{t('Empty')}</span>
        )
      }
      crumbs={['Provider', 'status', 'copyApplianceSSHPrivateSecret']}
      helpContent={t(
        'SSH key pair used by the copy appliance template and copy appliances for this provider.',
      )}
      testId="copy-appliance-ssh-secrets-detail-item"
      title={t('SSH secrets')}
    />
  );
};

export default CopyApplianceSSHSecretsDetailsItem;
