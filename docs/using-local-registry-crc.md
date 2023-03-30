# Using the local register

Local registry allow to pass container images from the local development environment to the cluster.
It is used like remote container registries (e.g. `docker.io` and `quay.io`), users tag the image
with the registry prefix, and then push the image.

Using Openshift internal registry requires some extra steps that are not needed in a kubernetes cluster
created by KinD, If you are using a cluster created by kind you can skip to the KinD section below.

### Openshift (CRC)

When using Openshift, a local registry is available as a service, see the [documentation](https://docs.openshift.com/container-platform/4.7/registry/securing-exposing-registry.html).

If your openshift cluster does not expose the registery, use this command to expose it.

``` bash
oc patch configs.imageregistry.operator.openshift.io/cluster --patch '{"spec":{"defaultRoute":true}}' --type=merge
```

On CRC the registry is exposed using a route named default-route in the openshift-image-registry namespace

``` bash
# get the registry route
REGISTRY_ROUTE=$(oc get route default-route -n openshift-image-registry --template='{{ .spec.host }}')

# login into the local registry using your admin token:
podman login -u kubeadmin -p $(oc whoami -t) ${REGISTRY_ROUTE} --tls-verify=false
```

The registry uses tls with internal certificate, to ues is without registring the certificate, use the flag `--tls-verify=false`

The cluster intenal image will use the internal dns, and an imagestream.

#### Push the image to the internal registry

``` bash
NAMESPACE=kubev2v
IMAGE_NAME=forklift-console-plugin-dev

# create an image stream for our image
oc create namespace ${NAMESPACE}
oc create imagestream ${IMAGE_NAME} -n ${NAMESPACE}

# note:check imagestream and images
oc get imagestreams -A
oc get images -A

# tag the image using the extrenal registry prefix
# IMPORTANT:
#   inside the cluster the image name will use the internal DNS and not the external route
#   for example: image-registry.openshift-image-registry.svc:5000/${NAMESPACE}/${IMAGE_NAME}
podman tag quay.io/kubev2v/forklift-console-plugin ${REGISTRY_ROUTE}/${NAMESPACE}/${IMAGE_NAME}

# push the image to the local registry
podman push ${REGISTRY_ROUTE}/${NAMESPACE}/${IMAGE_NAME} --tls-verify=false
```

#### Use the image in the intrnal registry

Inside the cluster the image will get an internal name using the cluster internal DNS

``` bash
IMAGE=image-registry.openshift-image-registry.svc:5000/${NAMESPACE}/${IMAGE_NAME}

# now we can use the image for deployments inside our cluster
oc process -f ci/yaml/forklift-plugin-dev.tpl.yaml -p=NAMESPACE=openshift-mtv -p=IMAGE=${IMAGE} | oc apply -f -
```
