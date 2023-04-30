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
