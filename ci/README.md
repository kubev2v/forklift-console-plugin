# CI scripts

## Openshift console web application

The console is a more friendly kubectl in the form of a single page webapp. It also integrates with other services like monitoring, chargeback, and OLM. Some things that go on behind the scenes include:
https://github.com/openshift/console

See [deploy-console.sh](ci/deploy-console.sh).

### Running with additional plugins

The `start-console.sh` script supports loading additional OpenShift console plugins alongside forklift using the `--plugins` flag. This is particularly useful when developing features that rely on other plugins (e.g. the monitoring plugin is needed to see Prometheus-backed performance metrics).

```bash
# Forklift only (default)
bash ./ci/start-console.sh

# With monitoring plugin (for Prometheus metrics)
bash ./ci/start-console.sh --plugins monitoring-plugin

# With multiple plugins
bash ./ci/start-console.sh --plugins monitoring-plugin,kubevirt-plugin

# With all available plugins
bash ./ci/start-console.sh --plugins all

# With OAuth and plugins
bash ./ci/start-console.sh --auth --plugins all

# Show help
bash ./ci/start-console.sh --help
```

Available plugins: `monitoring-plugin` (port 9002), `networking-console-plugin` (port 9003), `nmstate-console-plugin` (port 9004), `kubevirt-plugin` (port 9005).

Each plugin is cloned into a sibling directory (e.g. `../monitoring-plugin`) on first use, then its dev server is started on its assigned port. The forklift plugin always runs on port 9001.

## Forklift CI

Scripts and tools for creating and deploying forklift cluster infrastructure and running integration tests against it.
See instructions about how to [install forklift on kind](https://github.com/kubev2v/forkliftci).

https://github.com/kubev2v/forkliftci

```bash
# Deploying mock providers requires forkliftci:
git clone git@github.com:kubev2v/forkliftci.git ./ci/forkliftci
```

## Hyperconverged Cluster Operator

It is recomended to install Kubevirt using HCO operator. HCO operator makes sure the different parts of Kubevirt match, Forklift CI scripts install Kubevirt using the HCO versioning system.

https://github.com/kubevirt/hyperconverged-cluster-operator/blob/main/hack/config

See [deploy-kubevirt.sh](ci/deploy-kubevirt.sh).
