## Auto generate typescritp types

``` bash
npm install crdtoapi

# copy all CRD files from forklift git repository to ./crds:
https://github.com/kubev2v/forklift/tree/main/operator/config/crd/bases


# Use the CRDs in the ./crd directory to create an openapi.yaml file:
npx crdtoapi -i $(pwd)/crds/ > $(pwd)/openapi.yaml

# Create models:
npx crdtotypes -i $(pwd)/openapi.yaml -o $(pwd)/models

# Create openshift console UI model constants:
npx crdtomodel -i $(pwd)/crds/ -o ./constants

# Replace IoK8sApimachineryPkgApisMetaV1ObjectMeta.ts with the one from kubernetes:
sed -i '/IoK8sApimachineryPkgApisMetaV1ObjectMeta/d' ./models/index.ts
find ./models -type f -exec sed -i 's/\.\/IoK8sApimachineryPkgApisMetaV1ObjectMeta/\.\.\/\.\.\/kubernetes\/models\/IoK8sApimachineryPkgApisMetaV1ObjectMeta/g' {} +
```

# Model types (./models):

Auto generated constants for Forlklift k8s resources

# UI model constants (./constants):

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
