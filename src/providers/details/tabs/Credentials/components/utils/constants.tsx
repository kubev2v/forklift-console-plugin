import { ForkliftTrans } from 'src/utils/i18n';

export const InsecureSkipVerifyHelperTextPopover = (
  <ForkliftTrans>
    <p>
      Select <strong>Skip certificate validation</strong> to skip certificate verification, which
      proceeds with an insecure migration and then the certificate is not required. Insecure
      migration means that the transferred data is sent over an insecure connection and potentially
      sensitive data could be exposed.
    </p>
  </ForkliftTrans>
);

export const CacertHelperTextPopover = (
  <ForkliftTrans>
    <p>
      Use the CA certificate of the Manager unless it was replaced by a third-party certificate, in
      which case enter the Manager Apache CA certificate.
    </p>
    <p>When left empty the system CA certificate is used.</p>
    <p>
      The certificate is not verified when <strong>Skip certificate validation</strong> is set.
    </p>
  </ForkliftTrans>
);
