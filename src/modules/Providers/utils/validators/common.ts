// regex

// validate container images
// example: quay.io/image:latest
const REGISTRY = '(?:[a-z0-9]+([.:_-][a-z0-9]+)*\\/)?';
const IMAGE_NAME = '[a-z0-9]+([._-][a-z0-9]+)*(\\/[a-z0-9]+([._-][a-z0-9]+)*)*';
const TAG = '[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*';
const SHA256 = 'sha256:[A-Fa-f0-9]{64}';

const IMAGE_REGEX = new RegExp(`^${REGISTRY}?${IMAGE_NAME}((@${SHA256}|:${TAG}))?$`, 'u');

// validate URL
// example: https://example.com/index
const PROTOCOL = '(https?:\\/\\/)';
const IPV4 = '((?:[0-9]{1,3}\\.){3}[0-9]{1,3})';
const HOSTNAME = '([a-zA-Z0-9-_]+\\.[a-zA-Z0-9-_\\.]+)';
const PORT = '(:[0-9]+)?';
const PATH = '((\\/[^ ]*)*)?';
const QUERY_PARAMS = '(\\?[a-zA-Z0-9=&_]*)?';

const URL_REGEX = new RegExp(
  `^${PROTOCOL}((${IPV4})|(${HOSTNAME}))((${PORT})(${PATH})(${QUERY_PARAMS})?)?$`,
  'u',
);
const IPV4_REGEX = new RegExp(IPV4, 'u');

// validate NFS mount NFS_SERVER:EXPORTED_DIRECTORY
// example: 10.10.0.10:/backups
const NFS_PATH = '(\\/[^ ]*)+';
const NFS_REGEX = new RegExp(`^((${IPV4})|(${HOSTNAME})):(${NFS_PATH})$`, 'u');

// validate CA certification.
const CERTIFICATE_HEADER = '-----BEGIN CERTIFICATE-----';
const CERTIFICATE_FOOTER = '-----END CERTIFICATE-----';
const BASE64_LINE = '([A-Za-z0-9+\\/=]{1,1256}\\r?\\n)';
const LAST_BASE64_LINE = '([A-Za-z0-9+\\/=]{1,1256}\\r?\\n)?';
const BASE64_CONTENT = `(${BASE64_LINE}*${LAST_BASE64_LINE})`;

const EMPTY_LINES = '((#[^\\r\\n]*)?\\s*\\r?\\n)*';

const CERTIFICATE_REGEX = new RegExp(
  `^(${EMPTY_LINES}${CERTIFICATE_HEADER}\\r?\\n${BASE64_CONTENT}${CERTIFICATE_FOOTER}${EMPTY_LINES})+$`,
  'u',
);

// validate CA certification fingerprint.
const FINGERPRINT_REGEX = /^(?:[a-fA-F0-9]{2}:){19}[a-fA-F0-9]{2}$/u;

/**
 * Validate sub domain names, used in K8s.
 * This is based on k8s doc: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-subdomain-names
 * @see  https://github.com/kubernetes/apimachinery/blob/0d057e543013c79e20abb000df19bc16d286b777/pkg/util/validation/validation.go#L205
 */
const DNS_SUBDOMAINS_NAME_REGEXP =
  /^(?=.{1,253}$)[a-z0-9](?:[-a-z0-9]*[a-z0-9])?(?:\.[a-z0-9](?:[-a-z0-9]*[a-z0-9])?)*$/u;

// validate bearer tokens, used in K8s
const JWT_TOKEN_REGEX = /^(?:[a-zA-Z0-9_=]+)\.(?:[a-zA-Z0-9_=]+)\.(?:[a-zA-Z0-9_\-+/=]*)$/u;
const K8S_TOKEN_REGEX = /^[a-z0-9]{6}.[a-z0-9]{16}$/u;
const TMP_TOKEN_REGEX = /^sha256~[A-Za-z0-9+/=_-]{43}$/u;

// helper methods

export const validateContainerImage = (image: string) => {
  return IMAGE_REGEX.test(image);
};

export const validateURL = (url: string) => {
  return URL_REGEX.test(url);
};

export const validateIpv4 = (value: string) => {
  return IPV4_REGEX.test(value);
};

export const validateNFSMount = (nfsPath: string) => {
  return NFS_REGEX.test(nfsPath);
};

export const validatePublicCert = (ca: string) => {
  return CERTIFICATE_REGEX.test(ca);
};

export const validateFingerprint = (fingerprint: string) => {
  return FINGERPRINT_REGEX.test(fingerprint);
};

export const validateK8sName = (k8sName?: string) => {
  return k8sName && DNS_SUBDOMAINS_NAME_REGEXP.test(k8sName);
};

export const validateK8sToken = (token: string) => {
  return JWT_TOKEN_REGEX.test(token) || K8S_TOKEN_REGEX.test(token) || TMP_TOKEN_REGEX.test(token);
};

export const validateNoSpaces = (value: string) => {
  // any string without spaces
  return /^[^\s]+$/u.test(value);
};

export const validateUsernameAndDomain = (value: string) => {
  // Must contain exactly one @, and no whitespace
  // example: user@domain valid, user@ domain OR user@@domain invalid
  return /^[^\s@]+@[^\s@]+$/u.test(value);
};
