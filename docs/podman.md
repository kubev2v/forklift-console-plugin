# Creating and publishing images

## Build an image

Before you can deploy your plugin on a cluster, you must build an image and
push it to an image registry.

### Build the image

```sh
# build the image and tag it
podman build -t quay.io/kubev2v/forklift-console-plugin:latest .
```

### Push the image

```sh
# login to a container repository
podman login quay.io

# push the image 
podman push quay.io/kubev2v/forklift-console-plugin:latest
```

NOTE: If you have a Mac with Apple silicon, you will need to add the flag
`--platform=linux/amd64` when building the image to target the correct platform
to run in-cluster.

### Run the image

Run the local image, expose and proxy the server to port 9001 (nginx default port is 8080).

```sh
podman run -it --rm -p 9001:8080 quay.io/kubev2v/forklift-console-plugin:latest
```
