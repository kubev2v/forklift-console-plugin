# Creating and publishing images

## Build an image

Before you can deploy your plugin on a cluster, you must build an image and
push it to an image registry.

### Build the image

```sh
# build the image and tag it
podman build -t quay.io/kubev2v/forklift-console-plugin -f Containerfile
```

### Push the image to a local repository

When developing locally we can set up a local repository to push images into our local cluster.

```sh
# tag the image using the repository URL,
# for example, lets use the local repository in http://localhost:5001
podman tag quay.io/kubev2v/forklift-console-plugin localhost:5001/forklift-console-plugin 

# once the image is tagged with the currect url and port, we can push
# it into the local repository
# Note: in the case of local repository, you may need to use --tls-verify=false flag
podman push localhost:5001/forklift-console-plugin --tls-verify=false
```

Once the image is pushed into the local repository, it can be used for deployment inside the cluster.

### Push the image to quay.io

```sh
# login to a container repository
podman login quay.io

# push the image 
podman push quay.io/kubev2v/forklift-console-plugin:latest
```

NOTE: If you have a Mac with Apple silicon, you will need to add the flag
`--platform=linux/amd64` when building the image to target the correct platform
to run in-cluster.

### Run the image on local PC

Run the local image, expose and proxy the server to port 9001 (nginx default port is 8080).

```sh
podman run -it --rm -p 9001:8080 quay.io/kubev2v/forklift-console-plugin:latest
```
