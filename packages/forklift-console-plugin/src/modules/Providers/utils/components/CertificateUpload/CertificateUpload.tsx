import React, { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, FileUpload, FileUploadProps, Flex, FlexItem } from '@patternfly/react-core';

import { FetchCertificateModal } from './FetchCertificateModal';

import './CertificateUpload.style.css';

export interface CertificateUploadProps extends FileUploadProps {
  url?: string;
}

/**
 * Provide the certificate using following paths:
 * 1. manual copy-paste (provided by FileUpload widget)
 * 2. uploading a file (provided by FileUpload widget)
 * 3. fetch from the specified URL (via tls-certificate endpoint) end verify
 */
export const CertificateUpload: FC<CertificateUploadProps> = ({
  id,
  url,
  value,
  filenamePlaceholder,
  browseButtonText,
  validated,
  onDataChange,
  onTextChange,
  onClearClick,
  isDisabled,
  type,
}) => {
  const { showModal } = useModal();
  const { t } = useForkliftTranslation();
  const isText = !type || type === 'text';
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
                isDisabled={isDisabled}
                variant="secondary"
                onClick={() =>
                  showModal(
                    <FetchCertificateModal
                      url={url}
                      handleSave={onTextChange}
                      existingCert={String(value)}
                    />,
                  )
                }
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
