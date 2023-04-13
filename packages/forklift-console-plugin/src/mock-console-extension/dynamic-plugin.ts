import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import { ContextProvider } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

/**
 * The plugin will be configured only if the DATA_SOURCE is 'mock'.
 */
const isDataSourceMock = process.env.DATA_SOURCE === 'mock';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = isDataSourceMock
  ? {
      MockPlugin: './mock-console-extension',
    }
  : {};

export const extensions: EncodedExtension[] = isDataSourceMock
  ? [
      {
        type: 'console.context-provider',
        properties: {
          provider: { $codeRef: 'MockPlugin.MockingContextProvider' },
          useValueHook: { $codeRef: 'MockPlugin.useValuesMockingContext' },
        },
      } as EncodedExtension<ContextProvider>,
    ]
  : [];
