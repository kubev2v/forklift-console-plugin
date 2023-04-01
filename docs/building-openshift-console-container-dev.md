# Compiling Openshift console in development mode to a container

As a longer lived alternative to [compiling and running Openshift console](./building-openshift-console.md),
the console can be build in development mode to a local container image.  The local
image can then be reused without rebuilding.

## Background

Running the webpack dev server for the plugin and connecting it to openshift-console
running off cluster from a container image is the primary way to develop.  The version
of console may be changed to use a specific version by including a container image on
the console start command.

For example, to run version 4.11 of console against a kind cluster already setup (see
[the base README](../README.md) for cluster setup details), use a command like this:

```bash
CONSOLE_IMAGE=quay.io/openshift/origin-console:4.11 \
    npm run console
```

However, if you want to see the full react component names, or if you want to see
any other console-in-development-mode data, we need to build our own image.  Development
images are not currently (31-March-2023) available.  The
`[Containerfile.console-dev](../build/console-dev/Containerfile.console-dev)` file
in `build/console-dev` directory will create a development build of console that can be used.


## Building

To build a container from the git repo current master, use the command:
```bash
podman build \
    -t localhost/console-dev:latest \
    -f ./Containerfile.console-dev \
    .
```

The build script used in the Containerfile will clone the git repo, apply patches to the
repo based on what branch is checked out, and then build.  Patches applied per branch
are in [the patches directories](../build/console-dev/patches) with one directory for
each branch that has been tested to compile properly.

Once the build completes, the new local image can be used to run console in dev mode:
```bash
CONSOLE_IMAGE=localhost/console-dev:latest \
    npm run console
```

Using one of these console dev images when running `npm run console` gives you access
to all of the sources and development build variables that are not available in the
standard production images.


## Building specific versions of console

To build the dev container for a different version, just use a different git branch name
for the `console_branch` build argument.  For example, to build for console version
4.13:
```bash
podman build \
    --build-arg console_branch=release-4.13 \
    -t localhost/console-dev:4.13 \
    -f ./Containerfile.console-dev \
    .
```
