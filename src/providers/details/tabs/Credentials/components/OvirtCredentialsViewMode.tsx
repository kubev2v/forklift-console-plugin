/* eslint-disable perfectionist/sort-objects */
import type { FC } from 'react';
import { DisplayTitle } from 'src/components/DetailItems/DetailItem';
import type { Fields } from 'src/modules/Providers/views/details/components/CredentialsSection/components/list/Fields';
import { FieldWithClipboardCopy } from 'src/modules/Providers/views/details/components/CredentialsSection/FieldWithClipboardCopy';
import { MaskedField } from 'src/modules/Providers/views/details/components/CredentialsSection/MaskedField';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DescriptionList, Text } from '@patternfly/react-core';

import { CacertHelperTextPopover, InsecureSkipVerifyHelperTextPopover } from './utils/constants';
import { getDecodedValue } from './utils/getDecodedValue';
import type { CredentialsViewModeByTypeProps } from './utils/types';

const OvirtCredentialsViewMode: FC<CredentialsViewModeByTypeProps> = ({ reveal, secret }) => {
  const { t } = useForkliftTranslation();

  const fields: Fields = {
    user: {
      description: t(
        'A username for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint. Ensure the username is in the format of username@user-domain. For example: admin@internal.',
      ),
      label: t('Username'),
    },
    password: {
      description: t(
        'A user password for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint.',
      ),
      label: t('Password'),
    },
    insecureSkipVerify: {
      description: t("If true, the provider's CA certificate won't be validated."),
      displayType: 'switch',
      helperTextPopover: InsecureSkipVerifyHelperTextPopover,
      label: t('Skip certificate validation'),
    },
    cacert: {
      description: t(
        'A CA certificate to be trusted when connecting to the Red Hat Virtualization Manager (RHVM) API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
      ),
      displayType: 'textArea',
      helperTextPopover: CacertHelperTextPopover,
      label: t('CA certificate'),
    },
  };

  const user = getDecodedValue(secret?.data?.user);
  const password = getDecodedValue(secret?.data?.password);
  const insecureSkipVerify = getDecodedValue(secret?.data?.insecureSkipVerify);
  const cacert = getDecodedValue(secret?.data?.cacert);

  return (
    <>
      <div className="forklift-page-secret-title-div">
        <DescriptionList className="forklift-page-secret-title">
          <DisplayTitle title={fields.user.label} />
        </DescriptionList>
        <Text>{fields.user.description}</Text>
      </div>
      <div className="forklift-page-secret-content-div">
        {reveal ? (
          <FieldWithClipboardCopy field={fields.user} value={user ?? ''} />
        ) : (
          <MaskedField />
        )}
      </div>
      <div className="forklift-page-secret-title-div">
        <DescriptionList className="forklift-page-secret-title">
          <DisplayTitle title={fields.password.label} />
        </DescriptionList>
        <Text>{fields.password.description}</Text>
      </div>
      <div className="forklift-page-secret-content-div">
        {reveal ? (
          <FieldWithClipboardCopy field={fields.password} value={password ?? ''} />
        ) : (
          <MaskedField />
        )}
      </div>
      <div className="forklift-page-secret-title-div">
        <DescriptionList>
          <DisplayTitle
            title={fields.insecureSkipVerify.label}
            showHelpIconNextToTitle={true}
            helpContent={<Text>{fields.insecureSkipVerify.helperTextPopover}</Text>}
          />
        </DescriptionList>
        <Text>{fields.insecureSkipVerify.description}</Text>
      </div>
      <div className="forklift-page-secret-content-div">
        {reveal ? (
          <FieldWithClipboardCopy
            field={fields.insecureSkipVerify}
            value={insecureSkipVerify ?? ''}
          />
        ) : (
          <MaskedField />
        )}
      </div>
      <div className="forklift-page-secret-title-div">
        <DescriptionList>
          <DisplayTitle
            title={fields.cacert.label}
            showHelpIconNextToTitle={true}
            helpContent={<Text>{fields.cacert.helperTextPopover}</Text>}
          />
        </DescriptionList>
        <Text>{fields.cacert.description}</Text>
      </div>
      <div className="forklift-page-secret-content-div">
        {reveal ? (
          <FieldWithClipboardCopy field={fields.cacert} value={cacert ?? ''} />
        ) : (
          <MaskedField />
        )}
      </div>
    </>
  );
};

export default OvirtCredentialsViewMode;
