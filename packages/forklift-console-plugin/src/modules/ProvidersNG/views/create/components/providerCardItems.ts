import { SelectableGalleryItem } from 'src/modules/ProvidersNG/utils/components/Galerry/SelectableGallery';

export const providerCardItems: Record<string, SelectableGalleryItem> = {
  openshift: {
    title: 'OpenShift Virtualization',
    content: 'OpenShift Virtualization run and manage virtual machine in Openshift.',
  },
  openstack: {
    title: 'OpenStack',
    content: 'OpenStack is a cloud computing platform that controls large pools of resources.',
  },
  ovirt: {
    title: 'Red Hat Virtualization',
    content: 'Red Hat Virtualization (RHV) is a virtualization platform from Red Hat.',
  },
  vsphere: {
    title: 'vSphere',
    content: "vSphere is VMware's cloud computing virtualization platform.",
  },
};
