export interface ITLSCertificate {
  subject: {
    CN: string;
    C: string;
  };
  issuer: {
    CN: string;
    DC: string[];
    C: string;
    ST: string;
    O: string;
    OU: string;
  };
  subjectaltname: string;
  valid_from: string;
  valid_to: string;
  fingerprint: string;
  fingerprint256: string;
  serialNumber: string;
  modulus: string;
  bits: number;
  exponent: string;
  pubkey: {
    type: string;
    data: number[];
  };
  raw: {
    type: string;
    data: number[];
  };
  pemEncoded: string;
}
