/** Unified file containing typed provider secrets */

/**
 * Provider secret containing credentials and other confidential information
 * for OpenShift.
 *
 * @export
 * @interface OpenShiftProviderSecret
 */
export interface OpenShiftProviderSecret {
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
   * VSphere server thumbprint
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
   * Provider type: OVirt
   * Conditions: Required if insecureSkipVerify is false
   * Validation Regexp:
   *    ssl public key: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  cacert: string;

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
  domainName: string;

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
  region: string;

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
  projectName: string;

  /**
   * Indicate that the client can ignore certifacte verification.
   *
   * Provider type: openstack
   * Conditions: Optional
   *
   * @type {boolean}
   * @memberof ProviderSecret
   */
  insecure: boolean;

  /**
   * openstack server cacerts, can be a linked list of multple certifications.
   *
   * Provider type: openstack
   * Conditions: Required if insecure is false
   * Validation Regexp:
   *    ssl public key: .*
   *
   * @type {string}
   * @memberof ProviderSecret
   */
  cacert: string;
}
