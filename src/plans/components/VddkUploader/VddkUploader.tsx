import { type FC, useState } from 'react';

import {
  Alert,
  Button,
  FileUpload,
  Form,
  FormGroup,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import { useWatchVddkImage } from './hooks/useWatchVddkImage';
import { uploadVddkTarball } from './utils/utils';

const VddkUploader: FC = () => {
  const [file, setFile] = useState<File | undefined>();
  const [filename, setFilename] = useState('');
  const [buildName, setBuildName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const result = useWatchVddkImage(buildName);

  const handleUpload = async () => {
    if (!file) return;

    setError(null);
    setUploading(true);
    setBuildName(null);

    try {
      const response = await uploadVddkTarball(file);
      // setBuildName(response?.buildName);
      // eslint-disable-next-line no-console
      console.log('🚀 ~ handleUpload ~ response:', response);
    } catch (err) {
      setError((err as Error).message);
      // eslint-disable-next-line no-console
      console.log('🚀 ~ handleUpload ~ err:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form>
      <FormGroup label="VDDK archive" isRequired>
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
        />
      </FormGroup>

      <Stack hasGutter>
        <StackItem>
          <Button onClick={handleUpload} isDisabled={!file || uploading}>
            {uploading ? 'Uploading…' : 'Start Upload'}
          </Button>
        </StackItem>

        {error && (
          <StackItem>
            <Alert variant="danger" title="Error">
              {error}
            </Alert>
          </StackItem>
        )}

        {result?.imageUrl && (
          <StackItem>
            <Alert variant="success" title="Image build complete">
              {result.imageUrl}
            </Alert>
          </StackItem>
        )}
        {result && (
          <StackItem>
            <Alert variant="info" title="Building image...">
              {result.status?.message}
            </Alert>
          </StackItem>
        )}
      </Stack>
    </Form>
  );
};

export default VddkUploader;
