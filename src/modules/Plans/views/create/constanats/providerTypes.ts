import {
  getVmwareLogo,
  openshiftLogo,
  openstackLogo,
  ovaLogo,
  redhatLogo,
} from 'src/components/images/logos';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

const providerTypes = (isDarkTheme: boolean) => ({
  openshift: {
    key: PROVIDER_TYPES.openshift,
    logo: openshiftLogo,
    title: 'OpenShift Virtualization',
  },
  openstack: {
    key: PROVIDER_TYPES.openstack,
    logo: openstackLogo,
    title: 'OpenStack',
  },
  ova: {
    key: PROVIDER_TYPES.ova,
    logo: ovaLogo,
    title: 'Open Virtual Appliance',
  },
  ovirt: {
    key: PROVIDER_TYPES.ovirt,
    logo: redhatLogo,
    title: 'Red Hat Virtualization',
  },
  vsphere: {
    key: PROVIDER_TYPES.vsphere,
    logo: getVmwareLogo(isDarkTheme),
    title: 'VMware',
  },
});

export default providerTypes;
