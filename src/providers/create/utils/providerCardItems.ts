import {
  getVmwareLogo,
  openshiftLogo,
  openstackLogo,
  ovaLogo,
  redhatLogo,
} from 'src/components/images/logos';
import type { SelectableGalleryItem } from 'src/modules/Providers/utils/components/Gallery/SelectableGallery';

export const providerCardItems: (isDarkTheme: boolean) => Record<string, SelectableGalleryItem> = (
  isDarkTheme,
) => ({
  openshift: {
    content:
      'Red Hat OpenShift Virtualization runs and manages virtual machines in Red Hat OpenShift.',
    logo: openshiftLogo,
    title: 'OpenShift Virtualization',
  },
  openstack: {
    content: 'OpenStack is a cloud computing platform that controls large pools of resources.',
    logo: openstackLogo,
    title: 'OpenStack',
  },
  ova: {
    content: 'An OVA file is a virtual appliance used by virtualization applications.',
    logo: ovaLogo,
    title: 'Open Virtual Appliance',
  },
  ovirt: {
    content: 'Red Hat Virtualization (RHV) is a virtualization platform from Red Hat.',
    logo: redhatLogo,
    title: 'Red Hat Virtualization',
  },
  vsphere: {
    content: "VMware vSphere is VMware's cloud computing virtualization platform.",
    logo: getVmwareLogo(isDarkTheme),
    title: 'VMware',
  },
});
