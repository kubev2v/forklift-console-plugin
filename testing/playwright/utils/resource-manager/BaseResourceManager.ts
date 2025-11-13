import { API_PATHS, COOKIE_NAMES, HTTP_HEADERS, RESOURCE_KINDS, RESOURCE_TYPES } from './constants';

/**
 * Base class providing shared functionality for resource manager classes
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class BaseResourceManager {
  public static getCsrfTokenFromCookie(): string {
    const cookies = document.cookie.split('; ');
    const csrfCookie = cookies.find((cookie) => cookie.startsWith(`${COOKIE_NAMES.CSRF_TOKEN}=`));
    return csrfCookie ? csrfCookie.split('=')[1] : '';
  }

  /**
   * Returns a function string for extracting CSRF token from cookies.
   * This is used in page.evaluate() contexts where functions cannot be serialized.
   *
   * @returns A string that defines getCsrfTokenFromCookie function
   */
  public static getCsrfTokenFunctionString(): string {
    return `const getCsrfTokenFromCookie = () => {
      const cookies = document.cookie.split('; ');
      const csrfCookie = cookies.find((cookie) => cookie.startsWith(evalConstants.CSRF_TOKEN_NAME + '='));
      return csrfCookie ? csrfCookie.split('=')[1] : '';
    };`;
  }

  public static getEvaluateConstants() {
    return {
      CSRF_TOKEN_NAME: COOKIE_NAMES.CSRF_TOKEN,
      CONTENT_TYPE_HEADER: HTTP_HEADERS.CONTENT_TYPE,
      APPLICATION_JSON: HTTP_HEADERS.APPLICATION_JSON,
      CSRF_TOKEN_HEADER: HTTP_HEADERS.CSRF_TOKEN,
      FORKLIFT_PATH: API_PATHS.FORKLIFT,
      KUBEVIRT_PATH: API_PATHS.KUBEVIRT,
      KUBERNETES_CORE: API_PATHS.KUBERNETES_CORE,
      OPENSHIFT_PROJECT_PATH: API_PATHS.OPENSHIFT_PROJECT,
      VIRTUAL_MACHINES_TYPE: RESOURCE_TYPES.VIRTUAL_MACHINES,
      PROJECTS_TYPE: RESOURCE_TYPES.PROJECTS,
      NAMESPACES_TYPE: RESOURCE_TYPES.NAMESPACES,
    } as const;
  }

  public static getResourceTypeFromKind(kind: string): string {
    const kindToType: Record<string, string> = {
      [RESOURCE_KINDS.MIGRATION]: RESOURCE_TYPES.MIGRATIONS,
      [RESOURCE_KINDS.NETWORK_MAP]: RESOURCE_TYPES.NETWORK_MAPS,
      [RESOURCE_KINDS.PLAN]: RESOURCE_TYPES.PLANS,
      [RESOURCE_KINDS.PROVIDER]: RESOURCE_TYPES.PROVIDERS,
      [RESOURCE_KINDS.VIRTUAL_MACHINE]: RESOURCE_TYPES.VIRTUAL_MACHINES,
      [RESOURCE_KINDS.PROJECT]: RESOURCE_TYPES.PROJECTS,
      [RESOURCE_KINDS.NAMESPACE]: RESOURCE_TYPES.NAMESPACES,
    };

    return kindToType[kind] ?? `${kind.toLowerCase()}s`;
  }
}
