# Setup local Openshift cluster

## Install CRC

See CRC installation instructions in the [cli-tools](cli-tools.md) section.

## Deploy a cluster

``` bash
# set up the Openshift local tool
crc setup

# start a new Openshift cluster
crc start
```

### Login using kubeadmin user

When the cluster is ready, you can log into the cluster using the `oc` command.

``` bash
# use this command to get the login commands, to log into the cluster
crc console --credentials
```

For information of creating new users see the [create-service-account-with-token](create-service-account-with-token.md) section.
