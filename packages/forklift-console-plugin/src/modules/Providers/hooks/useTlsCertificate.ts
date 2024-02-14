import { useEffect, useState } from 'react';
import { KJUR, pemtohex, X509, zulutodate } from 'jsrsasign';

import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

import { getServicesApiUrl } from '../utils';

/**
 * @param value PEM encoded certificate
 * @returns parsed certificate or undefined if parsing failed
 */
const parseToX509 = (value: string) => {
  if (!value) return undefined;
  try {
    const cert = new X509();
    cert.readCertPEM(value);
    return cert;
  } catch (e) {
    return undefined;
  }
};

/**
 * @param pemEncodedCert valid PEM encoded certificate
 * @returns SHA1 thumbprint
 */
export const calculateThumbprint = (pemEncodedCert: string) =>
  KJUR.crypto.Util.hashHex(pemtohex(pemEncodedCert), 'sha1');

/**
 * @param url URL param for the tls-certificate endpoint
 * @returns certificate and props calculated/parsed based on the certificate
 */
export const useTlsCertificate = (url: string) => {
  const [certificate, setCertificate] = useState('');
  const [fetchError, setFetchError] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    consoleFetch(getServicesApiUrl(`tls-certificate?URL=${url}`), {
      method: 'GET',
    })
      .then((response: Response) => response.text())
      .then((certificate) => setCertificate(certificate))
      .catch((e) => setFetchError(e))
      .then(() => setLoading(false));
  }, [url]);

  const x509Cert: X509 = parseToX509(certificate);
  const certError = !x509Cert && !loading && !fetchError;
  const {
    thumbprint = '',
    issuer = '',
    validTo = undefined,
  } = x509Cert
    ? {
        thumbprint: calculateThumbprint(certificate),
        issuer: KJUR.asn1.x509.X500Name.onelineToLDAP(x509Cert.getIssuerString()),
        validTo: zulutodate(x509Cert.getNotAfter()),
      }
    : {};

  return {
    loading,
    fetchError,
    certError,
    thumbprint,
    issuer,
    validTo,
    certificate,
  };
};
