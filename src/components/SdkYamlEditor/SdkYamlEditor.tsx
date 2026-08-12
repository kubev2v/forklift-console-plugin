import { type FC, Suspense } from 'react';
import { Base64 } from 'js-base64';
import Loading from 'src/components/Loading/Loading';

import { CodeEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Language } from '@patternfly/react-code-editor';
import { Bullseye } from '@patternfly/react-core';

import './SdkYamlEditor.scss';

type SdkYamlEditorProps = {
  minHeight?: string;
  onChange: (encodedValue: string) => void;
  value: string | undefined;
};

const SdkYamlEditor: FC<SdkYamlEditorProps> = ({ minHeight = '20rem', onChange, value }) => {
  const decodedValue = Base64.decode(value ?? '');

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      <div className="code-editor-container">
        <CodeEditor
          isMinimapVisible={false}
          language={Language.yaml}
          minHeight={minHeight}
          onChange={(val: string) => {
            onChange(Base64.encode(val));
          }}
          value={decodedValue}
        />
      </div>
    </Suspense>
  );
};

export default SdkYamlEditor;
