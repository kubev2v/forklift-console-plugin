import type { ChangeEvent, FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  FileUpload,
  type FileUploadProps,
  Flex,
  FlexItem,
} from '@patternfly/react-core';

import FetchCertificateModal, { type FetchCertificateModalProps } from './FetchCertificateModal';

type CertificateUploadProps = FileUploadProps & {
  url?: string;
  'data-testid'?: string;
};

/**
 * Provide the certificate using following paths:
 * 1. manual copy-paste (provided by FileUpload widget)
 * 2. uploading a file (provided by FileUpload widget)
 * 3. fetch from the specified URL (via tls-certificate endpoint) end verify
 */
const CertificateUpload: FC<CertificateUploadProps> = ({
  browseButtonText,
  'data-testid': dataTestId,
  filenamePlaceholder,
  id,
  isDisabled,
  onClearClick,
  onDataChange,
  onTextChange,
  type,
  url,
  validated,
  value,
}) => {
  const launcher = useModal();
  const { t } = useForkliftTranslation();
  const isText = !type || type === 'text';
  const onClick = () => {
    const syntheticEvent = {
      target: { value },
    } as ChangeEvent<HTMLTextAreaElement>;

    launcher<FetchCertificateModalProps>(FetchCertificateModal, {
      existingCert: (value as string) ?? '',
      handleSave: (saved) => {
        onTextChange?.(syntheticEvent, saved);
      },
      url: url ?? '',
    });
  };

  return (
    <div data-testid={dataTestId}>
      <FileUpload
        id={id}
        type={type ?? 'text'}
        filenamePlaceholder={filenamePlaceholder ?? t('Drag and drop a file or upload one')}
        value={value}
        validated={validated}
        onDataChange={onDataChange}
        onTextChange={onTextChange}
        onClearClick={onClearClick}
        browseButtonText={browseButtonText ?? t('Upload')}
        isDisabled={isDisabled}
        className="pf-v6-u-p-0"
      >
        {url && isText && (
          <Flex>
            <FlexItem>
              <Button
                className="pf-v6-u-mt-sm"
                isDisabled={isDisabled ?? !url?.trim().startsWith('https://')}
                variant={ButtonVariant.secondary}
                onClick={onClick}
              >
                {t('Fetch certificate from URL')}
              </Button>
            </FlexItem>
          </Flex>
        )}
      </FileUpload>
    </div>
  );
};

export default CertificateUpload;
