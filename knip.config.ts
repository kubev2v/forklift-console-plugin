import type { KnipConfig } from 'knip';

export default {
  entry: [
    'src/overview/OverviewPage.tsx',
    'src/overview/hooks/OverviewContext.ts',
    'src/overview/hooks/useOverviewContext.ts',

    'src/modules/Providers/views/create/ProvidersCreatePage.tsx',
    'src/modules/Providers/views/migrate/ProvidersCreateVmMigrationContext.tsx',
    'src/providers/list/ProvidersListPage.tsx',
    'src/providers/details/ProviderDetailsPage.tsx',
    'src/utils/types.ts',

    'src/modules/Plans/views/create/PlanCreatePage.tsx',
    'src/modules/Plans/views/details/PlanDetailsPage.tsx',
    'src/plans/create/PlanCreatePage.tsx',
    'src/plans/details/PlanDetailsNav.tsx',
    'src/plans/list/PlansListPage.tsx',

    'src/modules/NetworkMaps/views/list/NetworkMapsListPage.tsx',
    'src/modules/NetworkMaps/views/details/NetworkMapDetailsPage.tsx',
    'src/modules/NetworkMaps/yamlTemplates/defaultYamlTemplate.ts',

    'src/modules/StorageMaps/views/list/StorageMapsListPage.tsx',
    'src/modules/StorageMaps/views/details/StorageMapDetailsPage.tsx',
    'src/modules/StorageMaps/yamlTemplates/defaultYamlTemplate.ts',
  ],
  ignore: ['i18next-parser.config.js', 'testing/**', 'eslint.ide.config.ts'],
  ignoreBinaries: ['kubectl', 'test:e2e'],
  ignoreDependencies: ['ts-node'],
} satisfies KnipConfig;
