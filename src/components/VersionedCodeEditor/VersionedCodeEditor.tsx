import type { ComponentProps, FC } from 'react';
import { Base64 } from 'js-base64';
import Loading from 'src/overview/components/Loading';

import { CodeEditor as SDKCodeEditor } from '@openshift-console/dynamic-plugin-sdk';
import { CodeEditor as PFCodeEditor, Language as PFLanguage } from '@patternfly/react-code-editor';
import useOpenshiftClusterVersion from '@utils/hooks/useOpenshiftClusterVersion/useOpenshiftClusterVersion';

import { OCP_VERSION_4_18 } from './utils/constants';
import { isVersionGte } from './utils/utils';

type VersionedCodeEditorProps = Pick<
  ComponentProps<typeof PFCodeEditor>,
  'isReadOnly' | 'isDarkTheme'
> & {
  value: string | undefined;
  onChange: (encodedValue: string) => void;
  minHeight?: string;
};

// VersionedCodeEditor component that uses the appropriate CodeEditor based on OCP version
// https://issues.redhat.com/browse/MTV-2918
const VersionedCodeEditor: FC<VersionedCodeEditorProps> = ({
  isReadOnly,
  minHeight = '20rem',
  onChange,
  value,
}) => {
  const [ocpVersion, loaded] = useOpenshiftClusterVersion();

  const decodedValue = Base64.decode(value ?? '');

  if (!loaded) {
    return <Loading />;
  }

  // Checking it's OCP version 4.18 or greater to decide which CodeEditor to use
  // on OCP 4.17 PF code editor is not used, And
  // on OCP 4.19 SDK code editor is having a bug where it doesn't show the code
  if (isVersionGte(ocpVersion, OCP_VERSION_4_18)) {
    return (
      <PFCodeEditor
        language={PFLanguage.yaml}
        code={decodedValue}
        onChange={(val) => {
          onChange(Base64.encode(String(val)));
        }}
        height={minHeight}
        isMinimapVisible={false}
        isReadOnly={isReadOnly}
      />
    );
  }

  return (
    <SDKCodeEditor
      language="yaml"
      value={decodedValue}
      onChange={(val) => {
        onChange(Base64.encode(String(val)));
      }}
      minHeight={minHeight}
      showMiniMap={false}
    />
  );
};

export default VersionedCodeEditor;
