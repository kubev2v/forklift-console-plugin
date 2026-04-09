import ec2Img from './resources/aws-ec2.svg';
import hypervImg from './resources/hyperv.svg';
import ovaImg from './resources/open-virtual-appliance.png';
import openshiftImg from './resources/openshift-virtualization.svg';
import openstackImg from './resources/openstack2.svg';
import redhatImg from './resources/redhat.svg';
import vmwareImgDark from './resources/vmware-dark.svg';
import vmwareImgLight from './resources/vmware-light.svg';

import './logos.scss';

export const ec2Logo = (
  <img
    className="forklift--create-provider-edit-card-title-logo"
    src={ec2Img}
    alt="Amazon EC2 logo"
  />
);

export const openshiftLogo = (
  <img
    className="forklift--create-provider-edit-card-title-logo"
    src={openshiftImg}
    alt="PatternFly logo"
  />
);

export const openstackLogo = (
  <img
    className="forklift--create-provider-edit-card-title-logo"
    src={openstackImg}
    alt="PatternFly logo"
  />
);

export const redhatLogo = (
  <img
    className="forklift--create-provider-edit-card-title-logo"
    src={redhatImg}
    alt="PatternFly logo"
  />
);

export const ovaLogo = (
  <img
    className="forklift--create-provider-edit-card-title-logo"
    src={ovaImg}
    alt="PatternFly logo"
  />
);

export const hypervLogo = (
  <img
    className="forklift--create-provider-edit-card-title-logo"
    src={hypervImg}
    alt="Microsoft Hyper-V logo"
  />
);

const vmLogoLight = (
  <img
    className="forklift--create-provider-edit-card-title-logo"
    src={vmwareImgLight}
    alt="PatternFly logo"
  />
);

const vmLogoDark = (
  <img
    className="forklift--create-provider-edit-card-title-logo"
    src={vmwareImgDark}
    alt="PatternFly logo"
  />
);

export const getVmwareLogo = (isDarkTheme: boolean) => (isDarkTheme ? vmLogoLight : vmLogoDark);
