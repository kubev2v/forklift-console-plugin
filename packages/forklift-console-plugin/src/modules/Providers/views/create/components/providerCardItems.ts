import {
  openshiftLogo,
  openstackLogo,
  ovaLogo,
  redhatLogo,
  vmLogo,
} from 'src/components/images/logos';
import { SelectableGalleryItem } from 'src/modules/Providers/utils/components/Galerry/SelectableGallery';

export const providerCardItems: Record<string, SelectableGalleryItem> = {
  vsphere: {
    title: 'vSphere',
    logo: vmLogo,
    content: "vSphere is VMware's cloud computing virtualization platform.",
  },
  ovirt: {
    title: 'Red Hat Virtualization',
    logo: redhatLogo,
    content: 'Red Hat Virtualization (RHV) is a virtualization platform from Red Hat.',
  },
  openstack: {
    title: 'OpenStack',
    logo: openstackLogo,
    content: 'OpenStack is a cloud computing platform that controls large pools of resources.',
  },
  ova: {
    title: 'Open Virtual Appliance (OVA)',
    logo: ovaLogo,
    content: 'OVA file is a virtual appliance used by virtualization applications.',
  },
  openshift: {
    title: 'OpenShift Virtualization',
    logo: openshiftLogo,
    content: 'OpenShift Virtualization run and manage virtual machine in OpenShift.',
  },
};
