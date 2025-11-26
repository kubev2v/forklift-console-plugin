// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { CreateForkliftContextProvider } from 'src/forkliftWrapper/ForkliftContext';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useForkliftContext } from 'src/forkliftWrapper/useForkliftContext';

import type { ContextProvider } from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  ForkliftContext: './forkliftWrapper/ForkliftContext',
  useForkliftContext: './forkliftWrapper/useForkliftContext',
};
export const extensions: EncodedExtension[] = [
  {
    properties: {
      provider: { $codeRef: 'ForkliftContext.CreateForkliftContextProvider' },
      useValueHook: {
        $codeRef: 'useForkliftContext.useForkliftContext',
      },
    },
    type: 'console.context-provider',
  } as EncodedExtension<ContextProvider>,
];
