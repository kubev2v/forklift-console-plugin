import {
  openshiftLogo,
  openstackLogo,
  ovaLogo,
  redhatLogo,
  vmLogo,
} from 'src/components/images/logos';

const providerTypes = {
  vsphere: {
    title: 'vSphere',
    logo: vmLogo,
  },
  ovirt: {
    title: 'Red Hat Virtualization',
    logo: redhatLogo,
  },
  openstack: {
    title: 'OpenStack',
    logo: openstackLogo,
  },
  ova: {
    title: 'Open Virtual Appliance (OVA)',
    logo: ovaLogo,
  },
  openshift: {
    title: 'OpenShift Virtualization',
    logo: openshiftLogo,
  },
};

export default providerTypes;
