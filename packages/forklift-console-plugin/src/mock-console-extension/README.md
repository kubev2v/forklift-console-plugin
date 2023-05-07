# Mock console extention

This extention implements MSW browser worker as an OpenShift console plugin extnetion.

The extention sets up mock data as external to the query code using MockServerWorker
(MSW). This configuration allows the query code to have minimal knowledge of if the
plugin is running on mock data. Production builds will not need to include mock data.

Ref: [https://mswjs.io/docs/getting-started/integrate/browser](https://mswjs.io)

## Openshift web console extention

The extention uses a `console.context-provider` console extension point
to inject the mock service worker very close to the start up of console.
The MSW worker is only setup once. The setup handler is logged to the
console before the context provider is done running.

## Run the extention
To run the plugin in dev mode with mock data, set the env variable `DATA_SOURCE=msw` and 
use the same command to start the dev server:

```sh
# set the DATA_SOURCE enviorment variable and run the command that starts your plugin
DATA_SOURCE=msw npm start
```

## Setting the REST mock data

Mock data is fetched in the file `setupBrowserWorker.tsx`.
In your code change the method `setupBrowserWorker` to get your mock data.

``` ts
// Implement your own getMockData to return an object containing the http return code, and the answer object
// 
// forklift-console-plugin implements getMockData method that mock data, the method gets
// the pathname, method and params, and returns the http code and bode,
// in your plugin, implement your own getMockData method.
// for exampel:
// ... if ( pathname == '/api/msg' )
// ... response = { statusCode: 200, body: { "msg": "hello world" }}
const mockResponse = getMockData({
    pathname: req.url.pathname,
    method: req.method,
    params: req.params,
});
```

## Setting up the extention in your plugin

Create the `mockServiceWorker.js` file and push it in to the `dist` directory before starting
the development server.

``` bash
msw init ./dist --save; npm start
```

Add the `Service-Worker-Allowed` http header to your plugin webpack config `devServer`
``` ts
'Service-Worker-Allowed': '/',
```

Add the mock console extention `exposedModules` and `extensions` to your plugin extentions file.

## Openshift forklift console plugin extension specifics

  - webpack dev server setup to serve MSW's `mockServerWorker.ts`
  - webpack dev server adds response header `Service-Worker-Allowed`
    with the value `/`.  Setting the header to `/` allows MSW to
    scope to `/` and mock ALL calls.
  - `forklift-console-plugin` has new extension `mock-console-extension`
    and it's `dynamic-plugin.ts` is sensitive to the `DATA_SOURCE`
    environment variable.