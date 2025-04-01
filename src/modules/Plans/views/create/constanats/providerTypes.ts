import { openshiftLogo, openstackLogo, redhatLogo, vmLogo } from 'src/components/images/logos';

const providerTypes = {
  openshift: {
    logo: openshiftLogo,
    title: 'OpenShift Virtualization',
  },
  openstack: {
    logo: openstackLogo,
    title: 'OpenStack',
  },
  ova: {
    title: 'Open Virtual Appliance (OVA)',
  },
  ovirt: {
    logo: redhatLogo,
    title: 'Red Hat Virtualization',
  },
  vsphere: {
    logo: vmLogo,
    title: 'vSphere',
  },
};

export default providerTypes;
