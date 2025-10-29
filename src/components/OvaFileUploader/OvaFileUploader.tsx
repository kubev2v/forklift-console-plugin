import { type FC, useState } from 'react';

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
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import {
  type OvaFileUploaderProps,
  OvaValidationVariant,
  type UploadOvaResponse,
} from './utils/types';
import { getUploadButtonLabel, uploadOva, validateOvaFileName } from './utils/utils';

const OvaFileUploader: FC<OvaFileUploaderProps> = ({ provider }) => {
  const { t } = useForkliftTranslation();
  const [file, setFile] = useState<File | undefined>();
  const [filename, setFilename] = useState('');
  const [response, setResponse] = useState<UploadOvaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validation, setValidation] = useState<OvaValidationVariant>(
    OvaValidationVariant.Indeterminate,
  );

  const handleUpload = async () => {
    if (!file) return;

    setError(null);
    setUploading(true);
    setResponse(null);

    try {
      const responseApi = await uploadOva(provider, file);
      setResponse(responseApi);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form>
      <FormGroup label={t('Upload local OVA file')} isRequired={false}>
        <FileUpload
          id="ova-file"
          filename={filename}
          onFileInputChange={(_, newFile) => {
            if (newFile) {
              setFile(newFile);
              setFilename(newFile.name);
              setValidation(validateOvaFileName(newFile.name));
            }
          }}
          hideDefaultPreview
          isRequired
          onClearClick={() => {
            setFile(undefined);
            setFilename('');
            setValidation(OvaValidationVariant.Indeterminate);
            setResponse(null);
            setError(null);
          }}
          className="pf-v6-u-p-0"
        />
        <HelperText>
          <HelperTextItem variant={validation}>
            {validation === OvaValidationVariant.Error
              ? t('The uploaded file name extension should be .ova')
              : t(
                  "Upload an OVA file which will be added to provider's virtual machines. The uploaded file name extension should be .ova",
                )}
          </HelperTextItem>
        </HelperText>
      </FormGroup>

      <Stack hasGutter>
        <StackItem>
          <Button
            isLoading={uploading}
            onClick={handleUpload}
            isDisabled={!file || validation === OvaValidationVariant.Error || uploading}
          >
            {getUploadButtonLabel(uploading)}
          </Button>
        </StackItem>

        {error && (
          <StackItem>
            <Alert variant="danger" title={t('Error')}>
              {error}
              {response?.message}
            </Alert>
          </StackItem>
        )}

        {response && isEmpty(error) && (
          <StackItem>
            <Alert variant="success" title={t('File uploaded')} />
          </StackItem>
        )}
      </Stack>
    </Form>
  );
};

export default OvaFileUploader;
