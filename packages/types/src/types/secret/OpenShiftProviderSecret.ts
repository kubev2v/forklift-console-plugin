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

  /**
   * OpenShift server cacerts, can be a linked list of multiple certifications.
   *
   * Provider type: OpenShift
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
   * Provider type: OpenShift
   * Conditions: Optional
   *
   * @type {boolean}
   * @memberof ProviderSecret
   */
  insecureSkipVerify?: boolean;
}
