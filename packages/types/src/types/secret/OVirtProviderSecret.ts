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
   * OVirt server cacerts, can be a linked list of multiple certifications.
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
   * Indicate that the client can ignore certificate verification.
   *
   * Provider type: OVirt
   * Conditions: Optional
   *
   * @type {boolean}
   * @memberof ProviderSecret
   */
  insecureSkipVerify?: boolean;
}
