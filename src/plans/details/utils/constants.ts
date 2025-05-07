import {
  openshiftLogo,
  openstackLogo,
  ovaLogo,
  redhatLogo,
  vmLogoDark,
  vmLogoLight,
} from 'src/components/images/logos';

export const providerTypeIcons = (isDarkTheme: boolean) => ({
  openshift: openshiftLogo,
  openstack: openstackLogo,
  ova: ovaLogo,
  ovirt: redhatLogo,
  vsphere: isDarkTheme ? vmLogoLight : vmLogoDark,
});

export const CRITICAL = 'Critical';
