# Setup local Kubernetes cluster

## Install KinD

See kind installation instructions in the [cli-tools](cli-tools.md) section.

## Deploy a cluster

``` bash
# optional, this step will delete any data currently on the cluster
bash ci/clean-cluster.sh

# run the cluster deployment script as a none root user
bash ci/deploy-cluster.sh
```
