import React, { type FC } from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, FileUpload, type FileUploadProps, Flex, FlexItem } from '@patternfly/react-core';

import { FetchCertificateModal } from './FetchCertificateModal';

import './CertificateUpload.style.css';

export type CertificateUploadProps = {
  url?: string;
} & FileUploadProps;

/**
 * Provide the certificate using following paths:
 * 1. manual copy-paste (provided by FileUpload widget)
 * 2. uploading a file (provided by FileUpload widget)
 * 3. fetch from the specified URL (via tls-certificate endpoint) end verify
 */
export const CertificateUpload: FC<CertificateUploadProps> = ({
  browseButtonText,
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
  const { showModal } = useModal();
  const { t } = useForkliftTranslation();
  const isText = !type || type === 'text';
  const onClick = () => {
    showModal(
      <FetchCertificateModal
        url={url}
        handleSave={(v) => {
          onTextChange(null, v);
        }}
        existingCert={value ? String(value) : undefined}
      />,
    );
  };

  return (
    <>
      <FileUpload
        id={id}
        type={type || 'text'}
        filenamePlaceholder={filenamePlaceholder || t('Drag and drop a file or upload one')}
        value={value}
        validated={validated}
        onDataChange={onDataChange}
        onTextChange={onTextChange}
        onClearClick={onClearClick}
        browseButtonText={browseButtonText || t('Upload')}
        isDisabled={isDisabled}
      >
        {url && isText && (
          <Flex>
            <FlexItem>
              <Button
                className="forklift-certificate-upload-margin"
                isDisabled={isDisabled || !url?.trim().startsWith('https://')}
                variant="secondary"
                onClick={onClick}
              >
                {t('Fetch certificate from URL')}
              </Button>
            </FlexItem>
          </Flex>
        )}
      </FileUpload>
    </>
  );
};
