import type { FC } from 'react';

import { SecretModel, type V1beta1Plan } from '@kubev2v/types';
import { getGroupVersionKindForModel, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace } from '@utils/crds/common/selectors';
import { getLUKSSecretName } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

type LUKSSecretLinkProps = {
  plan: V1beta1Plan;
};

const LUKSSecretLink: FC<LUKSSecretLinkProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();

  const luksSecretName = getLUKSSecretName(plan);

  if (luksSecretName)
    return (
      <ResourceLink
        groupVersionKind={getGroupVersionKindForModel(SecretModel)}
        name={luksSecretName}
        namespace={getNamespace(plan)}
      />
    );

  return <span className="text-muted">{t('No decryption keys defined')}</span>;
};

export default LUKSSecretLink;
