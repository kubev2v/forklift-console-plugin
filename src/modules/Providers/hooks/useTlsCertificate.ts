import { useEffect, useState } from 'react';
import { KJUR, pemtohex, X509, zulutodate } from 'jsrsasign';

import { consoleFetch } from '@openshift-console/dynamic-plugin-sdk';

import { getServicesApiUrl } from '../utils/helpers/getApiUrl';

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
  } catch (_e) {
    return undefined;
  }
};

export const toColonSeparatedHex = (hexString: string) =>
  Array.from(hexString.toUpperCase())
    // [a,b,c,d] => [[c,d][a,b]]
    .reduce(
      ([last = [], ...rest]: string[][], char: string) =>
        last.length !== 2 ? [[...last, char], ...rest] : [[char], last, ...rest],
      [],
    )
    // [[c,d][a,b]] => [[a,b], [c,d]]
    .reverse()
    .map((tuples) => tuples.join(''))
    .join(':');

/**
 * @param pemEncodedCert valid PEM encoded certificate
 * @returns SHA1 thumbprint
 */
export const calculateThumbprint = (pemEncodedCert: string) => {
  let thumbprint: string;

  try {
    thumbprint = toColonSeparatedHex(KJUR.crypto.Util.hashHex(pemtohex(pemEncodedCert), 'sha1'));
  } catch {
    thumbprint = '';
  }

  return thumbprint;
};

/**
 * @param url URL param for the tls-certificate endpoint
 * @returns certificate and props calculated/parsed based on the certificate
 */
export const useTlsCertificate = (url: string) => {
  const [certificate, setCertificate] = useState('');
  const [fetchError, setFetchError] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await consoleFetch(getServicesApiUrl(`tls-certificate?URL=${url}`), {
          method: 'GET',
        });
        const certificateText = await response.text();
        setCertificate(certificateText);
      } catch (e) {
        setFetchError(e);
      } finally {
        setLoading(false);
      }
    };

    (async () => {
      await fetchCertificate();
    })();
  }, [url]);

  const x509Cert: X509 = parseToX509(certificate);
  const certError = !x509Cert && !loading && !fetchError;
  const {
    issuer = '',
    thumbprint = '',
    validTo = undefined,
  } = x509Cert
    ? {
        issuer: KJUR.asn1.x509.X500Name.onelineToLDAP(x509Cert.getIssuerString()),
        thumbprint: calculateThumbprint(certificate),
        validTo: zulutodate(x509Cert.getNotAfter()),
      }
    : {};

  return {
    certError,
    certificate,
    fetchError,
    issuer,
    loading,
    thumbprint,
    validTo,
  };
};
