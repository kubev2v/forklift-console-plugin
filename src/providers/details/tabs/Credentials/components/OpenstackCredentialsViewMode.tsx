import type { FC } from 'react';
import { DisplayTitle } from 'src/components/DetailItems/DetailItem';
import type { Fields } from 'src/modules/Providers/views/details/components/CredentialsSection/components/list/Fields';
import { FieldWithClipboardCopy } from 'src/modules/Providers/views/details/components/CredentialsSection/FieldWithClipboardCopy';
import { MaskedField } from 'src/modules/Providers/views/details/components/CredentialsSection/MaskedField';

import { Content, ContentVariants, DescriptionList } from '@patternfly/react-core';

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
              helpContent={<Content component="p">{field?.helperTextPopover}</Content>}
              showHelpIconNextToTitle={true}
            />
          </DescriptionList>
          <Content component={ContentVariants.small} className="forklift-page-secret-subtitle">
            {field.description}
          </Content>
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
        <Content component={ContentVariants.small} className="forklift-page-secret-subtitle">
          {authTypeField.description}
        </Content>
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
            helpContent={
              <Content component="p">{insecureSkipVerifyField.helperTextPopover}</Content>
            }
            showHelpIconNextToTitle={true}
          />
        </DescriptionList>
        <Content component={ContentVariants.small} className="forklift-page-secret-subtitle">
          {insecureSkipVerifyField.description}
        </Content>
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
            helpContent={<Content component="p">{cacertField.helperTextPopover}</Content>}
            showHelpIconNextToTitle={true}
          />
        </DescriptionList>
        <Content component={ContentVariants.small} className="forklift-page-secret-subtitle">
          {cacertField.description}
        </Content>
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
