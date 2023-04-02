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
   * Indicate that the client can ignore certificate verification.
   *
   * Provider type: openstack
   * Conditions: Optional
   *
   * @type {boolean}
   * @memberof ProviderSecret
   */
  insecureSkipVerify?: boolean;

  /**
   * openstack server cacerts, can be a linked list of multiple certifications.
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
