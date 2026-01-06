import type { ContextProvider } from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  ForkliftContext: './onlineHelp/learningExperienceDrawer/context/ForkliftContext',
  useForkliftContext: './onlineHelp/learningExperienceDrawer/context/useForkliftContext',
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
