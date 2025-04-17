import type { FC } from 'react';
import { Base64 } from 'js-base64';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { Text, TextVariants } from '@patternfly/react-core';

import { FieldWithClipboardCopy } from '../../FieldWithClipboardCopy';
import { MaskedField } from '../../MaskedField';
import type { ListComponentProps } from '../BaseCredentialsSection';

import type { Fields } from './Fields';

export const OpenshiftCredentialsList: FC<ListComponentProps> = ({ reveal, secret }) => {
  const { t } = useForkliftTranslation();

  const items = [];

  const insecureSkipVerifyHelperTextPopover = (
    <ForkliftTrans>
      <p>
        Select <strong>Skip certificate validation</strong> to skip certificate verification, which
        proceeds with an insecure migration and then the certificate is not required. Insecure
        migration means that the transferred data is sent over an insecure connection and
        potentially sensitive data could be exposed.
      </p>
    </ForkliftTrans>
  );

  const cacertHelperTextPopover = (
    <ForkliftTrans>
      <p>
        Use the CA certificate of the Manager unless it was replaced by a third-party certificate,
        in which case enter the Manager Apache CA certificate.
      </p>
      <p>When left empty the system CA certificate is used.</p>
      <p>
        The certificate is not verified when <strong>Skip certificate validation</strong> is set.
      </p>
    </ForkliftTrans>
  );

  const fields: Fields = {
    cacert: {
      description: t(
        'A CA certificate to be trusted when connecting to Openshift API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
      ),
      displayType: 'textArea',
      helperTextPopover: cacertHelperTextPopover,
      label: t('CA certificate'),
    },
    insecureSkipVerify: {
      description: t("If true, the provider's CA certificate won't be validated."),
      displayType: 'switch',
      helperTextPopover: insecureSkipVerifyHelperTextPopover,
      label: t('Skip certificate validation'),
    },
    token: {
      description: (
        <div className="forklift-page-provider-field-default-validation">
          <ForkliftTrans>
            A service account token with cluster admin privileges, required for authenticating the
            connection to the API server.
          </ForkliftTrans>
        </div>
      ),
      label: t('Service account bearer token'),
    },
  };

  Object.entries(fields).forEach(([key, field]) => {
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
          {reveal ? <FieldWithClipboardCopy field={field} value={value} /> : <MaskedField />}
        </div>
      </>,
    );
  });

  return <>{items}</>;
};
