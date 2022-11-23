# Running the development server

The available script starts a containerized openshift console server.

| Script | Description  |
| -------|--------------|
| [start-console.sh](./start-console.sh) | Start Openshift web console when logged into a Openshift. |

## Avaliable environment variables

| Environment varialbles | Description  |
| -------|--------------|
| CONSOLE_IMAGE | The console image to run ( default `quay.io/openshift/origin-console:latest` )|
| CONSOLE_PORT | Expose the console web application on port ( default `9000` )|
| INVENTORY_SERVER_HOST | URL of Forklift inventory server ( default `http://localhost:8080` )|
| MUST_GATHER_API_SERVER_HOST | URL of Forklift must gather server ( default `http://localhost:8090` )|
| BRIDGE_K8S_AUTH_BEARER_TOKEN | Bearer token of user account ( on openshift token default to `$(oc whoami -t)` )|
| BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT | Kubernetes API servere URL (default, guess useing kubeconfig file) |

Scripts for pre-setting this environment varialbles are available in the [configure](./configure) directory.

## Finding the API server URL

### Running forklift controller locally

See the [CI](https://github.com/kubev2v/forkliftci) and [development](https://github.com/kubev2v/forklift) documentation for
instructions on how to run the forklift controller locally.

When running locally, use the `AUTH_REQUIRED=false` flag, this will allow `forklift-console-plugin` to query
the inventory server without the need to pass the bearer token.

In this scenario the inventory and must-gather URLs will be on the local machine running the controller.

``` bash
# When running locally the 
export INVENTORY_SERVER_HOST=http://localhost:30088
export MUST_GATHER_API_SERVER_HOST=http://localhost:< the port assigned for must gather role >
```

### Running forklift operator on CRC or Openshift

When running the forklift controller on an Openshift cluster, the inventory and must gather will be exposed using `routes`

Search for routes 
``` bash
# for example, if the forklift operator was installed on 'openshift-mtv', this command will get the inventory route,
# must-gather is usually not exposed outside the cluster
oc get routes -n openshift-mtv

export INVENTORY_SERVER_HOST=https://<route found>
```

### KinD

The development cluster using kind will not expose the inventory and mustgather outside the cluster.
