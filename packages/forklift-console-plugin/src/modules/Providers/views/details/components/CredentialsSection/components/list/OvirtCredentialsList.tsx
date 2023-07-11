import React from 'react';
import { Base64 } from 'js-base64';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ClipboardCopy, ClipboardCopyVariant, Text, TextVariants } from '@patternfly/react-core';

import { MaskedData } from '../../MaskedData';
import { ListComponentProps } from '../BaseCredentialsSection';

export const OvirtCredentialsList: React.FC<ListComponentProps> = ({ secret, reveal }) => {
  const { t } = useForkliftTranslation();

  const items = [];

  const fields = {
    user: { label: t('Username'), description: t('RH Virtualization engine REST API user name.') },
    password: {
      label: t('Password'),
      description: t('RH Virtualization engine REST API password credentials.'),
    },
    insecureSkipVerify: {
      label: t('Skip certificate validation'),
      description: t("If true, the provider's REST API TLS certificate won't be validated."),
    },
    cacert: {
      label: t('CA certificate'),
      description: t(
        'The CA certificate is the /etc/pki/ovirt-engine/apache-ca.pem file on the Manager machine.',
      ),
    },
  };

  for (const key in fields) {
    const field = fields[key];
    const base64Value = secret.data?.[key];
    const value = base64Value ? Base64.decode(secret.data[key]) : undefined;

    items.push(
      <>
        <div className="forklift-page-secret-title-div">
          <Text component={TextVariants.h6} className="forklift-page-secret-title">
            {field.label}
          </Text>
          <Text component={TextVariants.small} className="forklift-page-secret-subtitle">
            {field.description}
          </Text>
        </div>
        <div className="forklift-page-secret-content-div">
          {reveal ? (
            <ClipboardCopy
              isReadOnly
              hoverTip={t('Copy')}
              clickTip={t('Copied')}
              isCode
              variant={value && value.length > 128 ? ClipboardCopyVariant.expansion : undefined}
            >
              {value}
            </ClipboardCopy>
          ) : (
            <MaskedData />
          )}
        </div>
      </>,
    );
  }

  return <>{items}</>;
};
