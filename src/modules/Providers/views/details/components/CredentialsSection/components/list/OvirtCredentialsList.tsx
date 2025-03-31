import React from 'react';
import { Base64 } from 'js-base64';
import { DetailsItem } from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList, Text, TextVariants } from '@patternfly/react-core';

import { FieldWithClipboardCopy } from '../../FieldWithClipboardCopy';
import { MaskedField } from '../../MaskedField';
import type { ListComponentProps } from '../BaseCredentialsSection';

import type { Fields } from './Fields';

export const OvirtCredentialsList: React.FC<ListComponentProps> = ({ reveal, secret }) => {
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
        in which case enter the Manager Apache CA certificate. You can retrieve the Manager CA
        certificate at
        https://[engine_host]/ovirt-engine/services/pki-resource?resource=ca-certificate&format=X509-PEM-CA.
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
        'A CA certificate to be trusted when connecting to the Red Hat Virtualization Manager (RHVM) API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
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
    password: {
      description: t(
        'A user password for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint.',
      ),
      label: t('Password'),
    },
    user: {
      description: t(
        'A username for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint. Ensure the username is in the format of username@user-domain. For example: admin@internal.',
      ),
      label: t('Username'),
    },
  };

  for (const key in fields) {
    const field = fields[key];
    const base64Value = secret.data?.[key];
    const value = base64Value ? Base64.decode(secret.data[key]) : undefined;

    items.push(
      <>
        <div className="forklift-page-secret-title-div">
          <DescriptionList className="forklift-page-secret-title">
            <DetailsItem
              title={field.label}
              helpContent={
                key === 'insecureSkipVerify' || key === 'cacert' ? (
                  <Text>{field?.helperTextPopover}</Text>
                ) : null
              }
              showHelpIconNextToTitle={true}
              content={''}
            />
          </DescriptionList>
          <Text component={TextVariants.small} className="forklift-page-secret-subtitle">
            {field.description}
          </Text>
        </div>
        <div className="forklift-page-secret-content-div">
          {reveal ? <FieldWithClipboardCopy field={field} value={value} /> : <MaskedField />}
        </div>
      </>,
    );
  }

  return <>{items}</>;
};
