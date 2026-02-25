import { type ChangeEvent, type FC, Suspense, useRef } from 'react';
import Loading from 'src/components/Loading/Loading';

import { CodeEditor } from '@openshift-console/dynamic-plugin-sdk';
import type { Language } from '@patternfly/react-code-editor';
import { Bullseye, Button, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { UploadIcon } from '@patternfly/react-icons';
import { useIsDarkTheme } from '@utils/hooks/useIsDarkTheme';
import { useForkliftTranslation } from '@utils/i18n';

import { ACCEPTED_FILE_TYPES, type GuestType, LANGUAGE_MAP } from './constants';

type ScriptContentFieldProps = {
  guestType: GuestType;
  onChange: (value: string) => void;
  value: string;
};

const ScriptContentField: FC<ScriptContentFieldProps> = ({ guestType, onChange, value }) => {
  const { t } = useForkliftTranslation();
  const isDarkTheme = useIsDarkTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;

      if (typeof content === 'string') {
        onChange(content);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="pf-v6-u-screen-reader"
        onChange={handleFileUpload}
        accept={ACCEPTED_FILE_TYPES[guestType]}
      />

      <div className="pf-v6-c-code-editor">
        <div className="pf-v6-c-code-editor__header">
          <div className="pf-v6-c-code-editor__header-content">
            <div className="pf-v6-c-code-editor__controls">
              <Tooltip content={t('Upload file')}>
                <Button
                  variant={ButtonVariant.plain}
                  aria-label={t('Upload file')}
                  onClick={() => fileInputRef.current?.click()}
                  icon={<UploadIcon />}
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <Bullseye>
            <Loading />
          </Bullseye>
        }
      >
        <CodeEditor
          value={value}
          height="10rem"
          isDarkTheme={isDarkTheme}
          language={LANGUAGE_MAP[guestType] as Language}
          onChange={onChange}
        />
      </Suspense>
    </>
  );
};

export default ScriptContentField;
