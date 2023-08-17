import React from 'react';
import { SelectableGalleryItem } from 'src/modules/Providers/utils/components/Galerry/SelectableGallery';

import openshiftImg from '../images/openshift.svg';
import openstackImg from '../images/openstack.svg';
import ovaImg from '../images/ova.svg';
import redhatImg from '../images/redhat.svg';
import vmImg from '../images/vm.svg';

const openshiftLogo = (
  <img
    className="forklift--create-provider-edit-card-title-logo"
    src={openshiftImg}
    alt="PatternFly logo"
    width="27px"
  />
);

const openstackLogo = (
  <img
    className="forklift--create-provider-edit-card-title-logo"
    src={openstackImg}
    alt="PatternFly logo"
    width="27px"
  />
);

const vmLogo = (
  <img
    className="forklift--create-provider-edit-card-title-logo"
    src={vmImg}
    alt="PatternFly logo"
    width="27px"
  />
);

const redhatLogo = (
  <img
    className="forklift--create-provider-edit-card-title-logo"
    src={redhatImg}
    alt="PatternFly logo"
    width="27px"
  />
);

const ovaLogo = (
  <img
    className="forklift--create-provider-edit-card-title-logo"
    src={ovaImg}
    alt="PatternFly logo"
    width="27px"
  />
);

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
