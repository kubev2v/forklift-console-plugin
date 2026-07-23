import type { ReactElement } from 'react';

import ec2Img from './resources/aws-ec2.svg';
import hypervImg from './resources/hyperv.svg';
import nutanixImgDark from './resources/nutanix-dark.svg';
import nutanixImgLight from './resources/nutanix-light.svg';
import ovaImg from './resources/open-virtual-appliance.png';
import openshiftImg from './resources/openshift-virtualization.svg';
import openstackImg from './resources/openstack2.svg';
import redhatImg from './resources/redhat.svg';
import vmwareImgDark from './resources/vmware-dark.svg';
import vmwareImgLight from './resources/vmware-light.svg';

import './logos.scss';

export const ec2Logo = (
  <img
    alt="Amazon EC2 logo"
    className="forklift--create-provider-edit-card-title-logo"
    src={ec2Img}
  />
);

export const openshiftLogo = (
  <img
    alt="PatternFly logo"
    className="forklift--create-provider-edit-card-title-logo"
    src={openshiftImg}
  />
);

export const openstackLogo = (
  <img
    alt="PatternFly logo"
    className="forklift--create-provider-edit-card-title-logo"
    src={openstackImg}
  />
);

export const redhatLogo = (
  <img
    alt="PatternFly logo"
    className="forklift--create-provider-edit-card-title-logo"
    src={redhatImg}
  />
);

export const ovaLogo = (
  <img
    alt="PatternFly logo"
    className="forklift--create-provider-edit-card-title-logo"
    src={ovaImg}
  />
);

export const hypervLogo = (
  <img
    alt="Microsoft Hyper-V logo"
    className="forklift--create-provider-edit-card-title-logo"
    src={hypervImg}
  />
);

const vmLogoLight = (
  <img
    alt="PatternFly logo"
    className="forklift--create-provider-edit-card-title-logo"
    src={vmwareImgLight}
  />
);

const vmLogoDark = (
  <img
    alt="PatternFly logo"
    className="forklift--create-provider-edit-card-title-logo"
    src={vmwareImgDark}
  />
);

const nutanixLogoLight = (
  <img
    alt="Nutanix AHV logo"
    className="forklift--create-provider-edit-card-title-logo"
    src={nutanixImgLight}
  />
);

const nutanixLogoDark = (
  <img
    alt="Nutanix AHV logo"
    className="forklift--create-provider-edit-card-title-logo"
    src={nutanixImgDark}
  />
);

export const getNutanixLogo = (isDarkTheme: boolean): ReactElement =>
  isDarkTheme ? nutanixLogoLight : nutanixLogoDark;

export const getVmwareLogo = (isDarkTheme: boolean): ReactElement =>
  isDarkTheme ? vmLogoLight : vmLogoDark;
