# Compiling and running Openshift console

When developing a plugin it may be usefull to have the development version of the Openshift console.

## Reference

  - [Openshift web console](https://github.com/openshift/console) - Openshift web console git repository.
  - [Console dynamic plugin reference](https://github.com/openshift/console/blob/master/frontend/packages/console-dynamic-plugin-sdk) - Openshift web console dynamic plugin API reference.
  - [Console dynamic plugin example]( https://github.com/openshift/console/tree/master/dynamic-demo-plugin) - Example plugin code, contains information and examples of running the openshift console with plugins.
  - [Core dynamic plugin reference](https://github.com/openshift/dynamic-plugin-sdk) - Openshift core dynamic plugin API reference.

## Compiling and running Openshift console

See the instructions in [Openshift console](https://github.com/openshift/console) git repository.

## Using plugin with Openshift console

When running the console please use `--plugin` and `--plugin-proxy` CLI flags to enable forklift plugin:

`--plugin` sets the URL of the static plugin servier, for example if the `forklift-console-plugin` plugin is served on`http://localhost:9001`, use `--plugins="forklift-console-plugin=http://localhost:9001"`

`--plugin-proxy` is a json struct that sets proxy servers needed by the plugin, for example a json struct representing the forklift inventory server, looks like:

``` json
{
    "services":[
        {
            "consoleAPIPath":"/api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers",
            "endpoint":"https:///<forklift-inventory-konveyor-server>/providers",
            "authorize":true
        }
    ]
}
```

See the instructions in [Openshift console example plugin](https://github.com/openshift/console/tree/master/dynamic-demo-plugin).

## Example

RUnning the bridge with forklift plugin on a development setup, may look like that:

``` bash
./bin/bridge --plugins="forklift-console-plugin=http://localhost:9001" --plugin-proxy='{"services":[{"consoleAPIPath":"/api/proxy/plugin/hello-console-plugin/forklift-inventory/providers","endpoint":"https:///<forklift-inventory-konveyor-server>/providers","authorize":true}]}'
 ```
