/** Unified file containing typed provider secrets */

export type ProviderType = 'openshift' | 'vsphere' | 'ovirt' | 'openstack';

/**
 * Provider secret containing credentials and other confidential information
 *
 * @export
 * @interface ProviderSecret
 */
export type ProviderSecret =
  | OpenShiftProviderSecret
  | VSphereProviderSecret
  | OVirtProviderSecret
  | OpenstackProviderSecret;

/**
 * Provider secret containing credentials and other confidential information
 * for OpenShift.
 *
 * @export
 * @interface OpenShiftProviderSecret
 */
export interface OpenShiftProviderSecret {
  providerType: 'openshift';
  /**
   * k8s token for a user that can admin kubevirt on the k8s cluster
   *
   * Provider type: OpenShift
   * Conditions: Required
   * Validation Regexp:
   *    JW token:      /^([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_=]+)\.([a-zA-Z0-9_\-\+\/=]*)/gm
   *    kubeadm token: /^[a-z0-9]{6}.[a-z0-9]{16}$/
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  token: string;
}

/**
 * Provider secret containing credentials and other confidential information
 * for VSphere
 *
 * @export
 * @interface VSphereProviderSecret
 */
export interface VSphereProviderSecret {
  providerType: 'vsphere';
  /**
   * VSphere user name
   *
   * Provider type: VSphere
   * Conditions: Required
   * Validation Regexp: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  user: string;

  /**
   * VSphere user password
   *
   * Provider type: VSphere
   * Conditions: Required
   * Validation Regexp: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  password: string;

  /**
   * Indicate that the client can ignore certifacte verification.
   *
   * Provider type: OVirt
   * Conditions: Optional
   *
   * @type {boolean}
   * @memberof ProviderSecret
   */
  insecureSkipVerify?: boolean;

  /**
   * VSphere server thumbprint
   *
   * NOTE: thumbprint is not optional because CDI does not currently
   *       implement `insecureSkipVerify`. The `vddkImage` is using CDI
   *       and we can't remove this dependency at this point.
   *
   * Provider type: VSphere
   * Conditions: Required
   * Validation Regexp:
   *    secure hash algorithm (SHA1) signature: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  thumbprint: string;
}

/**
 * Provider secret containing credentials and other confidential information
 * for OVirt.
 *
 * @export
 * @interface OVirtProviderSecret
 */
export interface OVirtProviderSecret {
  providerType: 'ovirt';
  /**
   * OVirt user name
   *
   * Provider type: OVirt
   * Conditions: Required
   * Validation Regexp: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  user: string;

  /**
   * OVirt user password
   *
   * Provider type: OVirt
   * Conditions: Required
   * Validation Regexp: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  password: string;

  /**
   * OVirt server cacerts, can be a linked list of multple certifications.
   *
   * NOTE: ATM cacert is not optional because
   *       insecureSkipVerify is not implemented in our ovirt image-io client
   *
   * Provider type: OVirt
   * Conditions: Required if insecureSkipVerify is false
   * Validation Regexp:
   *    ssl public key: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  cacert?: string;

  /**
   * Indicate that the client can ignore certifacte verification.
   *
   * Provider type: OVirt
   * Conditions: Optional
   *
   * @type {boolean}
   * @memberof ProviderSecret
   */
  insecureSkipVerify?: boolean;
}

/**
 * Provider secret containing credentials and other confidential information
 * for Openstack.
 *
 * @export
 * @interface OpenstackProviderSecret
 */
export interface OpenstackProviderSecret {
  providerType: 'openstack';
  /**
   * openstack user name
   *
   * Provider type: openstack
   * Conditions: Required
   * Validation Regexp: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  username: string;

  /**
   * openstack user password
   *
   * Provider type: openstack
   * Conditions: Required
   * Validation Regexp: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  password: string;

  /**
   * openstack domain name
   *
   * Provider type: openstack
   * Conditions: Required
   * Validation Regexp: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  domainName?: string;

  /**
   * openstack region name
   *
   * Provider type: openstack
   * Conditions: Required
   * Validation Regexp: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  regionName?: string;

  /**
   * openstack domain name
   *
   * Provider type: openstack
   * Conditions: Required
   * Validation Regexp: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  projectName?: string;

  /**
   * Indicate that the client can ignore certifacte verification.
   *
   * Provider type: openstack
   * Conditions: Optional
   *
   * @type {boolean}
   * @memberof ProviderSecret
   */
  insecureSkipVerify?: boolean;

  /**
   * openstack server cacerts, can be a linked list of multple certifications.
   *
   * Provider type: openstack
   * Conditions: Required if insecureSkipVerify is false
   * Validation Regexp:
   *    ssl public key: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  cacert?: string;
}
