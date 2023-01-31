import { ITLSCertificate } from '../types';

export let MOCK_TLS_CERTIFICATE: ITLSCertificate;

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  MOCK_TLS_CERTIFICATE = {
    subject: {
      CN: 'vcenter.example.com',
      C: 'US',
    },
    issuer: {
      CN: 'CA',
      DC: ['vsphere', 'local'],
      C: 'US',
      ST: 'California',
      O: 'vcenter.example.com',
      OU: 'VMware Engineering',
    },
    subjectaltname: 'DNS:vcenter.example.com',
    modulus: '69F5FEB413F16B741612ED1DA42722627B165C3DB38413FD2830CA3A1113D83E5C23',
    bits: 2048,
    exponent: '0x10001',
    pubkey: {
      type: 'Buffer',
      data: [1, 2, 3, 4],
    },
    valid_from: 'Jan 1 19:20:54 2018 GMT',
    valid_to: 'Jan 1 19:20:51 2028 GMT',
    fingerprint: '39:5C:6A:2D:36:38:B2:52:2B:21:EA:74:11:59:89:5E:20:D5:D9:A2',
    fingerprint256:
      '05:CA:34:16:41:A9:58:2D:D6:0F:72:65:6D:AF:62:38:33:A1:65:4B:02:22:32:21:38:A9:74:DD:2E:60:E9:4A',
    serialNumber: 'DF14FCC59AD6D28A',
    raw: {
      type: 'Buffer',
      data: [1, 2, 3, 4],
    },
    pemEncoded: '-----BEGIN CERTIFICATE-----\ntHATHaJ1vQrmjxF6YNm9eJo=\n-----END CERTIFICATE-----',
  };
}
