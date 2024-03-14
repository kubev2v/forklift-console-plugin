# CI scripts

## Openshift console web application

The console is a more friendly kubectl in the form of a single page webapp. It also integrates with other services like monitoring, chargeback, and OLM. Some things that go on behind the scenes include:
https://github.com/openshift/console

See [deploy-console.sh](ci/deploy-console.sh).

## Forklift CI

Scripts and tools for creating and deploying forklift cluster infrastructure and running integration tests against it.
See instructions about how to [install forklift on kind](https://github.com/kubev2v/forkliftci).

https://github.com/kubev2v/forkliftci

``` bash
# Deploying mock providers requires forkliftci:
git clone git@github.com:kubev2v/forkliftci.git ./ci/forkliftci
```

## Hyperconverged Cluster Operator

It is recomended to install Kubevirt using HCO operator. HCO operator makes sure the different parts of Kubevirt match, Forklift CI scripts install Kubevirt using the HCO versioning system.

https://github.com/kubevirt/hyperconverged-cluster-operator/blob/main/hack/config

See [deploy-kubevirt.sh](ci/deploy-kubevirt.sh).