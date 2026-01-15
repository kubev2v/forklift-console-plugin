import type { ContextProvider } from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  LearningExperienceContext:
    './onlineHelp/learningExperienceDrawer/context/LearningExperienceContext',
  useLearningExperienceContext:
    './onlineHelp/learningExperienceDrawer/context/useLearningExperienceContext',
};
export const extensions: EncodedExtension[] = [
  {
    properties: {
      provider: { $codeRef: 'LearningExperienceContext.LearningExperienceContextProvider' },
      useValueHook: {
        $codeRef: 'useLearningExperienceContext.useLearningExperienceContext',
      },
    },
    type: 'console.context-provider',
  } as EncodedExtension<ContextProvider>,
];
