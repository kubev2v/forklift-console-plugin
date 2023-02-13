# models

Auto generated constants for Forlklift k8s resources

Each auto generated interface include the full model, GVK and a Ref.

Example:

``` ts
import { HookModel, HookModelGroupVersionKind, HookModelRef } from '@kubev2v/types';

// All constants represent the Hook resource model (for the generated apiVersion)
// GroupVersionKind - containe the { group, version, kind }
// Ref - contain a k8s URL reference used by the console to construct a query.
```

source: /ci/yaml/crds

## Manual overrides

Please edit and change needed properties like `color` and `abbr` where needed.

## Suggested manual changes:

| File | changed values |
|------|----------------|
| PlanModel.v1beta1.ts | color: '#0f930b' |
|                      | abbr: 'PL' |
| ProviderModel.v1beta1.ts | color: '#b51cb8' |
|                      | abbr: 'PR' |  |
| StorageMapModel.v1beta1.ts | color: '#f7b525' |
|                      | abbr: 'SM' |
| NetworkMapModel.v1beta1.ts | color: '#f7b525' |
|                      | abbr: 'NM' |
