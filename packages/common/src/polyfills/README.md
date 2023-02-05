# Polyfills

Set of hooks, Hocs and contexts that will allow the use of new openshift 
dynamice console sdk functionality while keeping competability with OCP 4.11

API:
| name | description |
|---|---|
| withModalProvider | Hoc method that add the modal context when using the polyfill version of `useModal`, not needed if using the SDK version |
| ActionService | https://github.com/openshift/console/blob/master/frontend/packages/console-dynamic-plugin-sdk/docs/api.md#actionserviceprovider |
| useModal | https://github.com/openshift/console/blob/master/frontend/packages/console-dynamic-plugin-sdk/docs/api.md#usemodal |
| ActionServiceProvider | https://github.com/openshift/console/blob/master/frontend/packages/console-dynamic-plugin-sdk/docs/api.md#actionserviceprovider |

Example:
``` ts
import { withModalProvider } from 'common/src/polyfills/sdk-shim';

...
const PageWrapper = withModalProvider(Page);
...
```
