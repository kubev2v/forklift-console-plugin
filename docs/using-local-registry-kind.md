# Using the local register

Local registry allow to pass container images from the local development environment to the cluster.
It is used like remote container registries (e.g. `docker.io` and `quay.io`), users tag the image
with the registry prefix, and then push the image.

Using Openshift internal registry requires some extra steps that are not needed in a kubernetes cluster
created by KinD, If you are using a cluster created by kind you can skip to the KinD section below.

### KinD

When creating the cluster using the `deploy-cluster.sh` script, a local registry is created on [http://localhost:5001)](http://localhost:5001)

Example of use:
``` bash
# tag the image using the repository URL,
# for example, lets use the local repository in http://localhost:5001
podman tag localhost:5001/forklift-console-plugin quay.io/kubev2v/forklift-console-plugin

# once the image is tagged with the currect url and port, we can push
# it into the local repository
# Note: in the case of local repository, you may need to use --tls-verify=false flag
podman push localhost:5001/forklift-console-plugin --tls-verify=false
```
