import {
  getVmwareLogo,
  openshiftLogo,
  openstackLogo,
  ovaLogo,
  redhatLogo,
} from 'src/components/images/logos';

export const providerTypeIcons = (isDarkTheme: boolean) => ({
  openshift: openshiftLogo,
  openstack: openstackLogo,
  ova: ovaLogo,
  ovirt: redhatLogo,
  vsphere: getVmwareLogo(isDarkTheme),
});
