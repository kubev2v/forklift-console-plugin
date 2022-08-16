# Compiling and running Openshift console

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

## Example

RUnning the bridge with forklift plugin on a development setup, may look like that:

``` bash
./bin/bridge --plugins="forklift-console-plugin=http://localhost:9001" --plugin-proxy='{"services":[{"consoleAPIPath":"/api/proxy/plugin/hello-console-plugin/forklift-inventory/providers","endpoint":"https:///<forklift-inventory-konveyor-server>/providers","authorize":true}]}'
 ```