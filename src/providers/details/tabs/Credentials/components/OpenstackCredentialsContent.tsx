import type { FC } from 'react';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

import {
  openstackAuthTypeField,
  openstackCacertField,
  openstackInsecureSkipVerifyField,
} from './utils/credentialsFields';
import { getDecodedValue } from './utils/getDecodedValue';
import { getOpenstackFieldsByAuthType } from './utils/getOpenstackFieldsByAuthType';
import CredentialContentField from './CredentialFieldContent';
import CredentialFields from './CredentialFields';

type OpenstackCredentialsContentProps = {
  secret: IoK8sApiCoreV1Secret;
  reveal: boolean;
};

const OpenstackCredentialsContent: FC<OpenstackCredentialsContentProps> = ({ reveal, secret }) => {
  const decodedAuthType = getDecodedValue(secret?.data?.authType);
  const openstackFields = getOpenstackFieldsByAuthType(decodedAuthType);
  const decodedInsecureSkipVerify = getDecodedValue(secret?.data?.insecureSkipVerify);
  const decodedCacert = getDecodedValue(secret?.data?.cacert);

  return (
    <>
      <DetailsItem
        testId={`credential-${OpenstackSecretFieldsId.AuthType}`}
        title={openstackAuthTypeField.label}
        content={<CredentialContentField value={decodedAuthType} reveal={reveal} />}
      />
      <CredentialFields fields={openstackFields} secret={secret} reveal={reveal} />
      <DetailsItem
        testId={`credential-${OpenstackSecretFieldsId.InsecureSkipVerify}`}
        title={openstackInsecureSkipVerifyField.label}
        helpContent={openstackInsecureSkipVerifyField.helperTextPopover}
        showHelpIconNextToTitle
        content={<CredentialContentField value={decodedInsecureSkipVerify} reveal={reveal} />}
      />
      <DetailsItem
        testId={`credential-${OpenstackSecretFieldsId.CaCert}`}
        title={openstackCacertField.label}
        helpContent={openstackCacertField.helperTextPopover}
        showHelpIconNextToTitle
        content={<CredentialContentField value={decodedCacert} reveal={reveal} />}
      />
    </>
  );
};

export default OpenstackCredentialsContent;
