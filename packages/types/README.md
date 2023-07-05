# @kubev2v/types

Manual and auto generated typescript models and constants for Forklift controller.

| Subdirectory              | Auto generated | Description                                                                                   | Contents                                                                                                                                                                                                                                              |
|---------------------------|----------------|-------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [constants](./src/constants)  | Auto | Contains auto-generated Openshift Web Console model constants.                                            | Auto-generated models, that can be manually adjusted.                                                                                                                                                                                                  |
| [models](./src/models)        | Auto | Contains auto-generated types for Kubernetes (k8s) models used in the project.               | Kubernetes (k8s) models used in the project, auto-generated from API definitions or other sources.                                                                                                                                                     |
| [types](./src/types)          | Manual | Contains manually created helper types and non-Kubernetes types used by the inventory API.    | - Helper types: Manually created types that assist in various tasks within the project.<br>- Non-Kubernetes types: Types that are used by the inventory API.                        |

## Auto generating new version

The typescript files are auto generated using forklift CRDs available from [<root>/ci/yaml/crds](/ci/yaml/crds).

to generate new API version, update the CRDs in [<root>/ci/yaml/crds](/ci/yaml/crds), and then:

a. run
``` bash
bash ./ci/update-types-package.sh
```

b. manually cleanup the generated code.
c. manually create or clean generated index files
d. run linter fix for final touch.
``` bash
npm run lint:fix
```

| CRD | Ref |
| ------------| --------|
| Openshift | https://github.com/openshift/api/tree/master/console/v1 |
| Forklift | https://github.com/kubev2v/forklift/tree/main/operator/config/crd/bases |

The script use the CRDs to generate OpenAPI file, and use that file to create model files.

## Lint

Auto generated files will contain linting errors, you can run `npm run lint:fix` to cleanup the code after auto-re-generation.

## Manual overrides

After auto generation is done, some manual tweeks can be done.

### Setting the models color and abbr.

The model constant is auto generated with `abbr` that defaults to first two letters of the kind, and undefined `color`.
It is sometimes advisable to manual change the defaults.

for example:

``` ts
export const HostModel = {
  label: 'Host',
  labelPlural: 'Hosts',

  abbr: 'HO',
  color: undefined,
  ...
};
```
can be manually edited to:

``` ts
export const HostModel = {
  label: 'Forklift Host',
  labelPlural: 'Forklift Hosts',

  abbr: 'H',
  color: '#f00',
  ...
};
```

## Tools

The auto generation script [update-types-package](/ci/update-types-package.sh) is a bash script
that run the auto generation proccess.

| Tools | Descroption | URL |
| ------| ----------- | --- |
| crdtoapi | create OpenAPI file from CRDs | https://github.com/yaacov/crdtoapi |
| crdtomodel | create k8s model constants from CRDs | https://github.com/yaacov/crdtoapi |
| openapi-generator-cli | create typescript interfaces from the OpenAPI file | https://github.com/OpenAPITools/openapi-generator-cli |
