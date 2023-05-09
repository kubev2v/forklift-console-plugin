import { MSW_MOCK_SOURCES } from '@kubev2v/mocks';
import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import { ContextProvider } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

const _exposedModules: ConsolePluginMetadata['exposedModules'] = {
  MockPlugin: './mock-console-extension',
};

const _extensions: EncodedExtension[] = [
  {
    type: 'console.context-provider',
    properties: {
      provider: { $codeRef: 'MockPlugin.MockingContextProvider' },
      useValueHook: { $codeRef: 'MockPlugin.useValuesMockingContext' },
    },
  } as EncodedExtension<ContextProvider>,
];

/**
 * The plugin will be configured only if the DATA_SOURCE is one of the MSW mock sources.
 */
const isDataSourceMock = MSW_MOCK_SOURCES.includes(process.env.DATA_SOURCE);

export const exposedModules = isDataSourceMock ? _exposedModules : {};
export const extensions = isDataSourceMock ? _extensions : [];
