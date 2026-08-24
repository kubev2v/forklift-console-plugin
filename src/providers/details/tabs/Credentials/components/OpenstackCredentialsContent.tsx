import type { FC } from 'react';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import type { IoK8sApiCoreV1Secret } from '@forklift-ui/types';

import {
  openstackAuthTypeField,
  openstackCacertField,
  openstackInsecureSkipVerifyField,
} from './utils/commonCredentialsFields';
import { getDecodedValue } from './utils/getDecodedValue';
import { getOpenstackFieldsByAuthType } from './utils/getOpenstackFieldsByAuthType';
import CredentialContentField from './CredentialFieldContent';
import CredentialFields from './CredentialFields';

type OpenstackCredentialsContentProps = {
  reveal: boolean;
  secret: IoK8sApiCoreV1Secret;
};

const OpenstackCredentialsContent: FC<OpenstackCredentialsContentProps> = ({ reveal, secret }) => {
  const decodedAuthType = getDecodedValue(secret?.data?.authType);
  const openstackFields = getOpenstackFieldsByAuthType(decodedAuthType);
  const decodedInsecureSkipVerify = getDecodedValue(secret?.data?.insecureSkipVerify);
  const decodedCacert = getDecodedValue(secret?.data?.cacert);

  return (
    <>
      <DetailsItem
        content={<CredentialContentField reveal={reveal} value={decodedAuthType} />}
        testId={`credential-${OpenstackSecretFieldsId.AuthType}`}
        title={openstackAuthTypeField.label}
      />
      <CredentialFields fields={openstackFields} reveal={reveal} secret={secret} />
      <DetailsItem
        content={<CredentialContentField reveal={reveal} value={decodedInsecureSkipVerify} />}
        helpContent={openstackInsecureSkipVerifyField.helperTextPopover}
        showHelpIconNextToTitle
        testId={`credential-${OpenstackSecretFieldsId.InsecureSkipVerify}`}
        title={openstackInsecureSkipVerifyField.label}
      />
      <DetailsItem
        content={<CredentialContentField reveal={reveal} value={decodedCacert} />}
        helpContent={openstackCacertField.helperTextPopover}
        showHelpIconNextToTitle
        testId={`credential-${OpenstackSecretFieldsId.CaCert}`}
        title={openstackCacertField.label}
      />
    </>
  );
};

export default OpenstackCredentialsContent;
