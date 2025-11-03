import { type FC, useEffect, useState } from 'react';

import {
  Alert,
  Button,
  FileUpload,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useVddkBuildImage } from './hooks/useVddkBuildImage';
import { getUploadButtonText, uploadVddkTarball } from './utils/utils';

type VddkUploaderProps = {
  onChangeVddk: (value: string) => void;
};

const VddkUploader: FC<VddkUploaderProps> = ({ onChangeVddk }) => {
  const { t } = useForkliftTranslation();
  const [file, setFile] = useState<File | undefined>();
  const [filename, setFilename] = useState('');
  const [buildName, setBuildName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const vddkBuild = useVddkBuildImage(buildName);
  const { body, isBuildFailed, isBuilding, isBuildSucceeded, title, variant } = vddkBuild ?? {};

  useEffect(() => {
    if (isBuildSucceeded) onChangeVddk(body!);
  }, [body, isBuildSucceeded, onChangeVddk]);

  const handleUpload = async () => {
    if (!file) return;

    setError(null);
    setUploading(true);
    setBuildName('');

    try {
      const response = await uploadVddkTarball(file);
      setBuildName(response?.['build-name']);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form>
      <FormGroup label={t('VDDK init image archive')} isRequired={false}>
        <FileUpload
          id="vddk-file"
          filename={filename}
          onFileInputChange={(_, newFile) => {
            if (newFile) {
              setFile(newFile);
              setFilename(newFile.name);
            }
          }}
          hideDefaultPreview
          isRequired
          onClearClick={() => {
            setFile(undefined);
            setFilename('');
          }}
          className="pf-v6-u-p-0"
        />
        <HelperText>
          <HelperTextItem>
            {t('Upload a VDDK archive and build a VDDK init image from it.')}
          </HelperTextItem>
        </HelperText>
      </FormGroup>

      <Stack hasGutter>
        <StackItem>
          <Button
            isLoading={uploading || isBuilding}
            onClick={handleUpload}
            isDisabled={!file || uploading || isBuilding}
          >
            {getUploadButtonText(uploading, isBuilding)}
          </Button>
        </StackItem>

        {error && (
          <StackItem>
            <Alert variant="danger" title={t('Error')}>
              {error}
            </Alert>
          </StackItem>
        )}

        {isBuildFailed && (
          <Alert variant={variant} title={title}>
            {body}
          </Alert>
        )}
      </Stack>
    </Form>
  );
};

export default VddkUploader;
