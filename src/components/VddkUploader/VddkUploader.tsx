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
    if (isBuildSucceeded && body) {
      onChangeVddk(body);
    }
  }, [body, isBuildSucceeded, onChangeVddk]);

  const handleUpload = async (): Promise<void> => {
    if (!file) {
      return;
    }

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
      <FormGroup isRequired={false} label={t('VDDK init image archive')}>
        <FileUpload
          className="pf-v6-u-p-0"
          filename={filename}
          hideDefaultPreview
          id="vddk-file"
          isRequired
          onClearClick={() => {
            setFile(undefined);
            setFilename('');
          }}
          onFileInputChange={(_, newFile) => {
            if (newFile) {
              setFile(newFile);
              setFilename(newFile.name);
            }
          }}
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
            isDisabled={!file || uploading || isBuilding}
            isLoading={uploading || isBuilding}
            onClick={handleUpload}
          >
            {getUploadButtonText(uploading, isBuilding)}
          </Button>
        </StackItem>

        {error && (
          <StackItem>
            <Alert title={t('Error')} variant="danger">
              {error}
            </Alert>
          </StackItem>
        )}

        {isBuildFailed && (
          <Alert title={title} variant={variant}>
            {body}
          </Alert>
        )}
      </Stack>
    </Form>
  );
};

export default VddkUploader;
