export enum OffloadPlugin {
  VSphereXcopyConfig = 'vsphereXcopyConfig',
}

export enum OffloadMatchStatus {
  Incomplete = 'incomplete',
  Optimal = 'optimal',
  Suboptimal = 'suboptimal',
}

// Reference: https://github.com/kubev2v/forklift/blob/53579b9ffdbf92098507fe58bc59f0856e6c890c/pkg/apis/forklift/v1beta1/mapping.go#L64
export enum StorageVendorProduct {
  FlashSystem = 'flashsystem',
  Vantara = 'vantara',
  Ontap = 'ontap',
  Primera3Par = 'primera3par',
  PowerFlex = 'powerflex',
  PowerMax = 'powermax',
  PowerStore = 'powerstore',
  PureFlashArray = 'pureFlashArray',
  Infinibox = 'infinibox',
}
