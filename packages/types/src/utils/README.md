# utils

## Helper methods

K8s utilites for converting resource constantns to the different types used in console method calls.
Some SDK methods use Ref other use GVK.

New methods should use GroupVersionKind (9 Feb 2023)

Example:

``` ts
const PlanGVK = modelToGroupVersionKind(PlanModel);
// PlanGVK === { version: 'v1', kind: 'Plan', group: 'good.group.com' }

const PlanRef = modelToRef(PlanModel);
// PlanRef === 'good.group.com'~v1~Plan'
```

## Auxilliary interfaces

The auto generated interfaces is generated from the backend GO code typing and documentation, in some
places the controller go code use untyped variables that will auto generate into typescropt `any`, to
fix this issue I added some helper manually crafted types to fill in the gaps.

NOTE: we should push for more typing in the controller go code ...

Example:

```ts
import { V1beta1Provider, OpenstackProviderSecret } from `@kubev2v/types`;

const myProvider: V1beta1Provider = ...

const myProviderSecret: OpenstackProviderSecret = ...
```
