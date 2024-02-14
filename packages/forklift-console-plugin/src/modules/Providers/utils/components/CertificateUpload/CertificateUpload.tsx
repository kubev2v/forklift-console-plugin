import React, { FC } from 'react';
import { useModal } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, FileUpload, FileUploadProps, Flex, FlexItem } from '@patternfly/react-core';

import { FetchCertificateModal } from './FetchCertificateModal';

export interface CertificateUploadProps {
  id?: string;
  url: string;
  cacert: string;
  validated: FileUploadProps['validated'];
  isDisabled: boolean;
  handleSave: (cacert: string) => void;
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
  cacert,
  handleSave,
  validated,
  isDisabled,
}) => {
  const { showModal } = useModal();
  const { t } = useForkliftTranslation();
  return (
    <>
      <FileUpload
        id={id}
        type="text"
        filenamePlaceholder={t('Drag and drop a file or upload one')}
        value={cacert}
        validated={validated}
        onDataChange={handleSave}
        onTextChange={handleSave}
        onClearClick={() => handleSave('')}
        browseButtonText={t('Upload')}
        isDisabled={isDisabled}
      >
        <Flex>
          <FlexItem>
            <Button
              isDisabled={!url || isDisabled}
              variant="link"
              onClick={() =>
                showModal(
                  <FetchCertificateModal url={url} handleSave={handleSave} existingCert={cacert} />,
                )
              }
            >
              {t('Fetch and verify certificate')}
            </Button>
          </FlexItem>
        </Flex>
      </FileUpload>
    </>
  );
};
