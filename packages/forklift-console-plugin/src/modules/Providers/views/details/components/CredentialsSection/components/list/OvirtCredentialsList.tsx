import React from 'react';
import { Base64 } from 'js-base64';
import { DetailsItem } from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ExternalLink } from '@kubev2v/common';
import {
  ClipboardCopy,
  ClipboardCopyVariant,
  DescriptionList,
  Text,
  TextVariants,
} from '@patternfly/react-core';

import { MaskedData } from '../../MaskedData';
import { ListComponentProps } from '../BaseCredentialsSection';

export const OvirtCredentialsList: React.FC<ListComponentProps> = ({ secret, reveal }) => {
  const { t } = useForkliftTranslation();

  const items = [];

  const fields = {
    user: {
      label: t('Username'),
      description: t(
        'A username for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint. Ensure the username is in the format of username@user-domain. For example: admin@internal.',
      ),
    },
    password: {
      label: t('Password'),
      description: t(
        'A user password for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint.',
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
        'A CA certificate to be trusted when connecting to the Red Hat Virtualization Manager (RHVM) API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
      ),
      helperTextPopover: (
        <ForkliftTrans>
          Note: Use the Manager CA certificate unless it was replaced by a third-party certificate,
          in which case use the Manager Apache CA certificate. <br />
          <br />
          You can retrieve the Manager CA certificate at:
          <br />
          <ExternalLink
            href="https://<rhv-host-example.com>/ovirt-engine/services/pki-resource?resource=ca-certificate&format=X509-PEM-CA"
            isInline
            hideIcon
          >
            https://&#8249;rhv-host-example.com&#8250;/ovirt-engine/services/pki-resource?resource=ca-certificate&format=X509-PEM-CA
          </ExternalLink>
          {' .'}
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
