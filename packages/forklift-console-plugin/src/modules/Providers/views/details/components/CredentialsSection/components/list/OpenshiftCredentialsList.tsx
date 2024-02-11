import React from 'react';
import { Base64 } from 'js-base64';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ClipboardCopy, ClipboardCopyVariant, Text, TextVariants } from '@patternfly/react-core';

import { MaskedData } from '../../MaskedData';
import { ListComponentProps } from '../BaseCredentialsSection';

export const OpenshiftCredentialsList: React.FC<ListComponentProps> = ({ secret, reveal }) => {
  const { t } = useForkliftTranslation();

  const items = [];

  const fields = {
    token: {
      label: t('Service account bearer token'),
      description: (
        <div className="forklift-page-provider-field-default-validation">
          <ForkliftTrans>
            A service account token with cluster admin privileges, required for authenticating the
            connection to the API server.
          </ForkliftTrans>
        </div>
      ),
    },
    insecureSkipVerify: {
      label: t('Skip certificate validation'),
      description: t("If true, the provider's CA certificate won't be validated."),
      helperTextPopover: (
        <ForkliftTrans>
          Note: If this field is checked/true, migrations from this provider will not be secure,
          meaning that the transferred data is sent over an insecure connection and potentially
          sensitive data could be exposed.
        </ForkliftTrans>
      ),
    },
    cacert: {
      label: t('CA certificate'),
      description: t(
        'A CA certificate to be trusted when connecting to Openshift API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
      ),
      helperTextPopover: (
        <ForkliftTrans>
          Note: Use the Manager CA certificate unless it was replaced by a third-party certificate,
          in which case use the Manager Apache CA certificate.
        </ForkliftTrans>
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
