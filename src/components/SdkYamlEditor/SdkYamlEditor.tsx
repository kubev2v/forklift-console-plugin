import { type FC, Suspense } from 'react';
import { Base64 } from 'js-base64';
import Loading from 'src/components/Loading/Loading';

import { CodeEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import './SdkYamlEditor.scss';

type SdkYamlEditorProps = {
  value: string | undefined;
  onChange: (encodedValue: string) => void;
  minHeight?: string;
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
          language="yaml"
          value={decodedValue}
          onChange={(val: string) => {
            onChange(Base64.encode(val));
          }}
          minHeight={minHeight}
          showMiniMap={false}
        />
      </div>
    </Suspense>
  );
};

export default SdkYamlEditor;
