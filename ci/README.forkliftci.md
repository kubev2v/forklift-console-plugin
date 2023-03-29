# forkliftci

Git forkliftci submodule - the forkliftci repository is linked as a submodule for easy usage.

forkliftci is the backend forklift tools for creating and deploying forklift cluster infrastructure and running integration tests against it.

Ref: https://github.com/kubev2v/forkliftci

## Git submodule

forkliftci is a submodule, it's not part of the forklift-console-plugin code,
to get the code, use git `submodule` commands.

``` bash
# when cloning the project use recurse-submodules
git clone --recurse-submodules https://github.com/chaconinc/MainProject

# When updating to latest version
git submodule update --init --recursive
```

## Usage

``` bash
# Once - create a local nfs server
# NOTE - run only once to create a server
#        require root permissions and create a server running on the local machine
sudo bash ./ci/forkliftci/cluster/providers/openstack/install_nfs.sh

# build a cluster with kubevirt-forklift and a set of demo providers using forkliftci
bash ./ci/deploy-all.sh --with-all-providers

# You can also install selected providers
#    --with-ovirt-provider, --with-vmware-provider, --with-openstack-provider
bash ./ci/deploy-all.sh --with-ovirt-provider
```

# Providers info

## Ovirt

``` bash
OVIRT_USERNAME=admin@internal
OVIRT_PASSWORD=123456
OVIRT_URL=https://fakeovirt.konveyor-forklift.svc.cluster.local:30001/ovirt-engine/api
```

```
-----BEGIN CERTIFICATE-----
MIIDtzCCAp+gAwIBAgIUeHhXLiJJpaIld4tY7I5f8m7RjtwwDQYJKoZIhvcNAQEL
BQAwQjELMAkGA1UEBhMCWFgxFTATBgNVBAcMDERlZmF1bHQgQ2l0eTEcMBoGA1UE
CgwTRGVmYXVsdCBDb21wYW55IEx0ZDAeFw0yMjExMDEwOTQ5NDNaFw0zMjEwMjkw
OTQ5NDNaMIGCMQswCQYDVQQGEwJYWDEVMBMGA1UEBwwMRGVmYXVsdCBDaXR5MRww
GgYDVQQKDBNEZWZhdWx0IENvbXBhbnkgTHRkMT4wPAYDVQQDDDVmYWtlb3ZpcnQu
a29udmV5b3ItZm9ya2xpZnQsaW1hZ2Vpby5rb252ZXlvci1mb3JrbGlmdDCCASIw
DQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALffxVPN+Lin21wDbPnFc1weibfD
mHqcXfzIMHaaHvV3MA3IXe5q3kmJlt1zc1ds4ydoaYRcJeNpuA7Fr4PdATHVqxZB
jC9m+wB/A16BgT69VPmnDWuzmkkn+NM8JdBRv+xOFJs1P9ndMFtHgSK1o/+sGpGj
aVuuZbOd4drG8bhYWKWhxHTDkFjGe9C82G6XY1Qk2gB2f5EA30uo/sSLYur69HiK
HSs7r+RAaES7wlM7Nz4Hrf4XAI2qcdHNI1T5ZpDXkZNpgC6l/9m5FIUjeVzHqf0g
MzCIPTBwjp4zJOMIQ21D4cXm2Zi/nlrM60IfAd7DZX2WqBCaUjELDHFTFUECAwEA
AaNkMGIwQQYDVR0RBDowOIIbZmFrZW92aXJ0LmtvbnZleW9yLWZvcmtsaWZ0ghlp
bWFnZWlvLmtvbnZleW9yLWZvcmtsaWZ0MB0GA1UdDgQWBBSoSoPKSAo3U0bDo/0U
hgAceY4ZgTANBgkqhkiG9w0BAQsFAAOCAQEAB4B7DCipsCxRYq8t0+a1IUYCcWbs
AI40GhRg2k6/p4gP2WU/v6TRpQ3HuxY2Tty3IdezMBZzeW2NgQBxt/Eo9cfWTs/5
yX7kICzQvrOabTgF84EcCeRlP+It9xjfWWG4adEyv0XETjYUG85rBW7ud8n6dOMY
cOgdOcJ1VvqDAfAF1uDYOIpEdqESrnqTxj+qewlBpBv2Y8m8na+AL9Sy6rdkV90e
xKfiJG/OQNJEzgpK1XUSh/Eg3gEnrpuA+jWxShOL0zJFbMQDA0oxv6wnBxLIZXpQ
8dDsiipGN6HDZUpzxHGFDDPB7xtCFGjyLBXCLegh+31XnZ7w6AzY3mIBYw==
-----END CERTIFICATE-----
```

## vmWare

``` bash
VMWARE_USER=administrator@vsphere.local
VMWARE_PASSWORD=123456
VMWARE_URL=https://vcsim.konveyor-forklift.svc.cluster.local:8989/sdk
VDDK_IMAGE=quay.io/kubev2v/vddk-test-vmdk
VMWARE_FINGERPRINT=52:6C:4E:88:1D:78:AE:12:1C:F3:BB:6C:5B:F4:E2:82:86:A7:08:AF
```

## Openstack

``` bash
OPENSTACK_USERNAME=admin
OPENSTACK_PASSWORD='12e2f14739194a6c'
OPENSTACK_REGION_NAME=RegionOne
OPENSTACK_AUTH_URL=http://packstack.konveyor-forklift.svc.cluster.local:5000/v3
OPENSTACK_PROJECT_NAME=admin
OPENSTACK_USER_DOMAIN_NAME=Default
```
