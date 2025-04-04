import type { KnipConfig } from 'knip';

export default {
  entry: [
    'src/modules/Overview/views/overview/OverviewPage.tsx',
    'src/modules/Overview/hooks/OverviewContextProvider.tsx',

    'src/modules/Providers/views/list/ProvidersListPage.tsx',
    'src/modules/Providers/views/details/ProviderDetailsPage.tsx',
    'src/modules/Providers/views/create/ProvidersCreatePage.tsx',
    'src/modules/Providers/views/migrate/ProvidersCreateVmMigrationContext.tsx',

    'src/modules/Plans/views/list/PlansListPage.tsx',
    'src/modules/Plans/views/create/PlanCreatePage.tsx',
    'src/plans/create/PlanCreatePage.tsx',
    'src/modules/Plans/views/details/PlanDetailsPage.tsx',

    'src/modules/NetworkMaps/views/list/NetworkMapsListPage.tsx',
    'src/modules/NetworkMaps/views/details/NetworkMapDetailsPage.tsx',
    'src/modules/NetworkMaps/yamlTemplates/defaultYamlTemplate.ts',

    'src/modules/StorageMaps/views/list/StorageMapsListPage.tsx',
    'src/modules/StorageMaps/views/details/StorageMapDetailsPage.tsx',
    'src/modules/StorageMaps/yamlTemplates/defaultYamlTemplate.ts',
  ],
  ignore: ['i18next-parser.config.js', 'testing/**'],
  ignoreBinaries: ['kubectl'],
  ignoreDependencies: ['@testing-library/cypress', 'ts-node'],
  rules: {
    binaries: 'error',
    classMembers: 'error',
    dependencies: 'error',
    devDependencies: 'error',
    duplicates: 'error',
    enumMembers: 'error',
    exports: 'error',
    files: 'error',
    nsExports: 'error',
    nsTypes: 'error',
    types: 'error',
    unlisted: 'error',
    unresolved: 'error',
  },
} satisfies KnipConfig;
