import type { FC } from 'react';

import { SecretModel, type V1beta1Plan } from '@kubev2v/types';
import { getGroupVersionKindForModel, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Label } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { getLUKSSecretName, getPlanHasNBDEClevis } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

type LUKSSecretLinkProps = {
  plan: V1beta1Plan;
};

const LUKSSecretLink: FC<LUKSSecretLinkProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();

  const luksSecretName = getLUKSSecretName(plan);
  const hasNBDEClevis = getPlanHasNBDEClevis(plan);

  if (hasNBDEClevis) {
    return (
      <Label isCompact data-testid="nbde-clevis-enabled-label">
        {t('NBDE/Clevis enabled')}
      </Label>
    );
  }

  if (luksSecretName) {
    return (
      <ResourceLink
        groupVersionKind={getGroupVersionKindForModel(SecretModel)}
        name={luksSecretName}
        namespace={getNamespace(plan)}
      />
    );
  }

  return (
    <Label isCompact data-testid="no-decryption-keys-label">
      {t('No decryption defined')}
    </Label>
  );
};

export default LUKSSecretLink;
