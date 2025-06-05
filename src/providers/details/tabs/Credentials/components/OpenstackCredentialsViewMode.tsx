import type { FC } from 'react';
import { DisplayTitle } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import type { Fields } from 'src/modules/Providers/views/details/components/CredentialsSection/components/list/Fields';
import { FieldWithClipboardCopy } from 'src/modules/Providers/views/details/components/CredentialsSection/FieldWithClipboardCopy';
import { MaskedField } from 'src/modules/Providers/views/details/components/CredentialsSection/MaskedField';

import { DescriptionList, Text, TextVariants } from '@patternfly/react-core';

import { getAuthTypeSecretFields } from './utils/getAuthTypeSecretFields';
import { getDecodedValue } from './utils/getDecodedValue';
import {
  authTypeField,
  cacertField,
  insecureSkipVerifyField,
  OpenStackCredentialsFields,
} from './utils/openStackCredentialsFields';
import type { CredentialsViewModeByTypeProps } from './utils/types';

const OpenstackCredentialsViewMode: FC<CredentialsViewModeByTypeProps> = ({ reveal, secret }) => {
  const decodedAuthType = getDecodedValue(secret?.data?.authType);
  const openstackSecretFields: Fields = getAuthTypeSecretFields(
    secret,
    OpenStackCredentialsFields,
    decodedAuthType,
  );

  const items: JSX.Element[] = [];
  const decodedCacert = getDecodedValue(secret?.data?.cacert);
  const decodedInsecureSkipVerifyField = getDecodedValue(secret?.data?.insecureSkipVerify);

  Object.entries(openstackSecretFields).forEach(([key, field]) => {
    const value = getDecodedValue(secret?.data?.[key]);

    items.push(
      <>
        <div className="forklift-page-secret-title-div">
          <DescriptionList className="forklift-page-secret-title">
            <DisplayTitle
              title={field.label}
              helpContent={<Text>{field?.helperTextPopover}</Text>}
              showHelpIconNextToTitle={true}
            />
          </DescriptionList>
          <Text component={TextVariants.small} className="forklift-page-secret-subtitle">
            {field.description}
          </Text>
        </div>
        <div className="forklift-page-secret-content-div">
          {reveal ? <FieldWithClipboardCopy field={field} value={value ?? ''} /> : <MaskedField />}
        </div>
      </>,
    );
  });

  return (
    <>
      <div className="forklift-page-secret-title-div">
        <DescriptionList className="forklift-page-secret-title">
          <DisplayTitle title={authTypeField.label} />
        </DescriptionList>
        <Text component={TextVariants.small} className="forklift-page-secret-subtitle">
          {authTypeField.description}
        </Text>
      </div>
      <div className="forklift-page-secret-content-div">
        {reveal ? (
          <FieldWithClipboardCopy field={authTypeField} value={decodedAuthType ?? ''} />
        ) : (
          <MaskedField />
        )}
      </div>

      {items}

      <div className="forklift-page-secret-title-div">
        <DescriptionList className="forklift-page-secret-title">
          <DisplayTitle
            title={insecureSkipVerifyField.label}
            helpContent={<Text>{insecureSkipVerifyField.helperTextPopover}</Text>}
            showHelpIconNextToTitle={true}
          />
        </DescriptionList>
        <Text component={TextVariants.small} className="forklift-page-secret-subtitle">
          {insecureSkipVerifyField.description}
        </Text>
      </div>
      <div className="forklift-page-secret-content-div">
        {reveal ? (
          <FieldWithClipboardCopy
            field={insecureSkipVerifyField}
            value={decodedInsecureSkipVerifyField ?? ''}
          />
        ) : (
          <MaskedField />
        )}
      </div>
      <div className="forklift-page-secret-title-div">
        <DescriptionList className="forklift-page-secret-title">
          <DisplayTitle
            title={cacertField.label}
            helpContent={<Text>{cacertField.helperTextPopover}</Text>}
            showHelpIconNextToTitle={true}
          />
        </DescriptionList>
        <Text component={TextVariants.small} className="forklift-page-secret-subtitle">
          {cacertField.description}
        </Text>
      </div>
      <div className="forklift-page-secret-content-div">
        {reveal ? (
          <FieldWithClipboardCopy field={cacertField} value={decodedCacert ?? ''} />
        ) : (
          <MaskedField />
        )}
      </div>
    </>
  );
};

export default OpenstackCredentialsViewMode;
