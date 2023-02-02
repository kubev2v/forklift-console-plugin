# Helm repository

[Helm](https://helm.sh/) is the best way to find, share, and use software built for Kubernetes.

## Forklift console plugin helm repository

(see forklift console plugin [helm repository code](/deployment/forklift-console-plugin))

| Template | Description |
|-----------|-------------|
| configmap | Includes the `nginx.conf` file. |
| deployment | Deploys the `nginx` server, serving static files. |
| service | Defines the ports exposed to outside by our deployment. |
| consoleplugin | Define who the Openshift console consume and use our plugin. |

| Parameter | Description | Default value |
|-----------|-------------|---------------|
| plugin | name of "app" label used for objects |  forklift-console-plugin
| namespace | the deployment namespace | konveyor-forklift
| image | the plugin container image | quay.io/kubev2v/forklift-console-plugin:[latest release branch]
| forklift.namespace | forklift-operator namespace | konveyor-forklift

## Running the helm chart locally

Running helm requires to be looged into the cluster, and using the namespace for the instalation:

``` bash
# login into the cluster
oc login ... 

# choose a project
oc project forklift-console-plugin
```

When you are logged in, and using the instalation project, you can use the local helm chart:

``` bash
# install local
helm install forklift ./deployment/forklift-console-plugin

# install using custom values
helm install forklift ./deployment/forklift-console-plugin --set forklift.namespace=openshift-mtv

# list all installed helm charts
helm list

# uninstall a helm chart
helm uninstall forklift
```

## Building the repository package

Sharing `forklift-console-plugin` helm chart is done by serving the helm package on github-pages.

We serve github pages using `gh-pages` branch, the repository include a `forklift-console-plugin-*.tgz` file that includes that helm repository templates, and an `index.yaml` metadata file.

``` bash
# creating a package file and pushing it into a local `tmp` directory
# once the package files are ready in the tmp direcoty, you can copy them to the gh-pages branch
# and publish the package using githup pages.
npm run helm:build
```

## Using the public repository

[ Running helm requires to be looged into the cluster, and using the namespace for the instalation ]

``` bash
# add the forklift helm repo
helm repo add forklift https://kubev2v.github.io/forklift-console-plugin

# install the chart using the repository package
helm install forklift forklift/forklift-console-plugin

# use optional vaiables
helm install forklift-console-plugin forklift/forklift-console-plugin --set forklift.namespace=openshift-mtv
```
