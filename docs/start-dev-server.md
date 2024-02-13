# Start the development server

The available script starts a containerized openshift console server.

| Script | Description  |
| -------|--------------|
| [start-console.sh](./start-console.sh) | Start Openshift web console when logged into a Openshift. |

Use `npm run` command to run this script:

``` bash
# Start a local Openshift console server.
# - The console will be available in http://localhost:9000
npm run console

# Start the server with authentication, requires Openshift authentication,
# use when looged in to Openshift cluster with authenticaion.
npm run console:auth

# Running Openshift console server on the background
# - TO close the console when running in the background run:
#   npm run console:stop
npm run console:background
npm run console:auth:background

# Start the plugin in development mode
npm run start
```

## Local KinD cluster

If you do not have access to a Kubernetes or Openshift cluster, you can run a local cluster using KinD.

``` bash
# Start a local KinD cluster with kubevirt and forklift running.
npm run cluster:up

# NOTE:
# kubevirt requires admin previliges to start a virtual machine on local KinD cluster.
# if your development flow requires to start a virtual machine inside the cluster, run the script
# using sudo ** do not use npm when runnin sudo **:
#     sudo bash ci/deploy-cluster.sh
```

Optionally, if you do not have access to already running providers (e.g oVirt, vmWare or Openstack), you can alsoe start some mock virtualization providers to run inside the cluster.

See the [ci](../ci) directory for more information.

``` bash
# Update the forkliftci submodule
git submodule update --init --recursive

# Example: setup a local KinD cluster with all mock providers
#          [ options: --with-all-providers --with-ovirt-provider, --with-vmware-provider, --with-openstack-provider]
npm run cluster:up -- --with-all-providers

# run cleanup to stop and delete the cluster.
npm run cluster:delete
```

## Available environment variables

| Environment variables | Description  |
| -------|--------------|
| CONSOLE_IMAGE | The console image to run ( default `quay.io/openshift/origin-console:latest` )|
| CONSOLE_PORT | Expose the console web application on port ( default `9000` )|
| INVENTORY_SERVER_HOST | URL of Forklift inventory server ( default `https://localhost:30444` )|
| MUST_GATHER_API_SERVER_HOST | URL of Forklift must gather server ( default `https://localhost:30445` )|
| SERVICES_API_SERVER_HOST | URL of Forklift services server ( default `https://localhost:30446` )|
| BRIDGE_K8S_AUTH_BEARER_TOKEN | Bearer token of user account ( on openshift token default to `$(oc whoami -t)` )|
| BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT | Kubernetes API servere URL (default, guess useing kubeconfig file) |

Scripts for pre-setting this environment variables are available in the [configure](./configure) directory.

## Finding the API server URL

### Running forklift controller locally

See the [CI](https://github.com/kubev2v/forkliftci) and [development](https://github.com/kubev2v/forklift) documentation for
instructions on how to run the forklift controller locally.

When running locally, use the `AUTH_REQUIRED=false` flag, this will allow `forklift-console-plugin` to query
the inventory server without the need to pass the bearer token.

In this scenario the inventory and must-gather URLs will be on the local machine running the controller.

``` bash
# When running locally the 
export INVENTORY_SERVER_HOST=https://localhost:30444
export MUST_GATHER_API_SERVER_HOST=https://localhost:< the port assigned for must gather role >
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

The development cluster using kind will expose the inventory server on port 30444 `https://loclhost:30444`.
