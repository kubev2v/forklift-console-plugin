import type { FC } from 'react';
import { DetailsItem } from 'src/components/DetailItems/DetailItem';

import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Stack, StackItem } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import {
  getCopyApplianceSSHPrivateSecret,
  getCopyApplianceSSHPublicSecret,
} from '@utils/crds/providers/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type { ProviderDetailsItemProps } from './utils/types';

const SECRET_GVK = { kind: 'Secret', version: 'v1' } as const;

const CopyApplianceSSHSecretsDetailsItem: FC<ProviderDetailsItemProps> = ({
  resource: provider,
}) => {
  const { t } = useForkliftTranslation();
  const namespace = getNamespace(provider);
  const secrets = [
    getCopyApplianceSSHPrivateSecret(provider),
    getCopyApplianceSSHPublicSecret(provider),
  ].filter((name): name is string => Boolean(name));

  return (
    <DetailsItem
      content={
        !isEmpty(secrets) && namespace ? (
          <Stack hasGutter>
            {secrets.map((name) => (
              <StackItem key={name}>
                <ResourceLink groupVersionKind={SECRET_GVK} name={name} namespace={namespace} />
              </StackItem>
            ))}
          </Stack>
        ) : (
          <span className="text-muted">-</span>
        )
      }
      crumbs={[
        'Provider',
        'status',
        'copyApplianceSSHPrivateSecret',
        'copyApplianceSSHPublicSecret',
      ]}
      helpContent={t(
        'SSH key pair used by the copy appliance template and copy appliances for this provider.',
      )}
      testId="copy-appliance-ssh-secrets-detail-item"
      title={t('SSH secrets')}
    />
  );
};

export default CopyApplianceSSHSecretsDetailsItem;
