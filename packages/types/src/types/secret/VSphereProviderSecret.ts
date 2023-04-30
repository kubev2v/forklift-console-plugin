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
   * Indicate that the client can ignore certificate verification.
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
