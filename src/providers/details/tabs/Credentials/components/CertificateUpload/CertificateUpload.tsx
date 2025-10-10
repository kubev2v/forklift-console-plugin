import type { ChangeEvent, FC } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Button,
  ButtonVariant,
  FileUpload,
  type FileUploadProps,
  Flex,
  FlexItem,
} from '@patternfly/react-core';

import FetchCertificateModal from './FetchCertificateModal';

import './CertificateUpload.style.scss';

type CertificateUploadProps = FileUploadProps & {
  url?: string;
};

/**
 * Provide the certificate using following paths:
 * 1. manual copy-paste (provided by FileUpload widget)
 * 2. uploading a file (provided by FileUpload widget)
 * 3. fetch from the specified URL (via tls-certificate endpoint) end verify
 */
const CertificateUpload: FC<CertificateUploadProps> = ({
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
    const syntheticEvent = {
      target: { value },
    } as ChangeEvent<HTMLTextAreaElement>;

    showModal(
      <FetchCertificateModal
        url={url ?? ''}
        handleSave={(saved) => {
          onTextChange?.(syntheticEvent, saved);
        }}
        existingCert={(value as string) ?? ''}
      />,
    );
  };

  return (
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
              className="forklift-certificate-upload-margin"
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
  );
};

export default CertificateUpload;
