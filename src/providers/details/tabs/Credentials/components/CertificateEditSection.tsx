import type { FC, FormEvent } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { type FileUploadProps, Switch } from '@patternfly/react-core';

import CertificateUpload from './CertificateUpload/CertificateUpload';
import { CacertHelperTextPopover, InsecureSkipVerifyHelperTextPopover } from './utils/constants';

type CertificateEditSectionProps = {
  insecureSkipVerifyValidation: ValidationMsg;
  insecureSkipVerify: string | undefined;
  cacertValidation: ValidationMsg;
  cacert: string | undefined;
  url: string | undefined;
  onChangeInsecure: (_event: FormEvent<HTMLInputElement>, checked: boolean) => void;
  onDataChange: (data: string) => void;
};

const CertificateEditSection: FC<CertificateEditSectionProps> = ({
  cacert,
  cacertValidation,
  insecureSkipVerify,
  insecureSkipVerifyValidation,
  onChangeInsecure,
  onDataChange,
  url,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <FormGroupWithHelpText
        label={t('Skip certificate validation')}
        labelHelp={
          <HelpIconPopover
            header={t('Skip certificate validation')}
            popoverProps={{ alertSeverityVariant: 'info' }}
          >
            {InsecureSkipVerifyHelperTextPopover}
          </HelpIconPopover>
        }
        fieldId="insecureSkipVerify"
      >
        <Switch
          className="forklift-section-secret-edit-switch"
          id="insecureSkipVerify"
          name="insecureSkipVerify"
          label={t('Skip certificate validation')}
          isChecked={insecureSkipVerify === 'true'}
          hasCheckIcon
          onChange={onChangeInsecure}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('CA certificate')}
        labelHelp={
          <HelpIconPopover
            header={t('CA certificate')}
            popoverProps={{ alertSeverityVariant: 'info' }}
          >
            {CacertHelperTextPopover}
          </HelpIconPopover>
        }
        fieldId="cacert"
        helperText={cacertValidation.msg}
        helperTextInvalid={cacertValidation.msg}
        validated={cacertValidation.type}
      >
        <CertificateUpload
          id="cacert"
          type="text"
          filenamePlaceholder={t('Drag and drop a file or upload one')}
          value={cacert}
          validated={cacertValidation.type as FileUploadProps['validated']}
          onDataChange={(_e, value) => {
            onDataChange(value);
          }}
          onTextChange={(_e, value) => {
            onDataChange(value);
          }}
          onClearClick={() => {
            onDataChange('');
          }}
          browseButtonText={t('Upload')}
          url={url}
          isDisabled={insecureSkipVerify === 'true'}
        />
      </FormGroupWithHelpText>
    </>
  );
};

export default CertificateEditSection;
