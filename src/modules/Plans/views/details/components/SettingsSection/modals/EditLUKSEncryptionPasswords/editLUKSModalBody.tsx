import { ExternalLink } from 'src/components/common/ExternalLink/ExternalLink';
import { ForkliftTrans } from 'src/utils/i18n';

export const VIRT_V2V_HELP_LINK =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.8/html-single/installing_and_using_the_migration_toolkit_for_virtualization/index#creating-migration-plan-2-8_cnv';

export const editLUKSModalBody = (
  <>
    <ForkliftTrans>
      <p>
        Specify a list of passphrases for the Linux Unified Key Setup (LUKS)-encrypted devices for
        the VMs that you want to migrate.
      </p>
      <br />
      <p>
        For each LUKS-encrypted device, Migration Toolkit for Virtualization (MTV) tries each
        passphrase until one unlocks the device.{' '}
        <ExternalLink isInline href={VIRT_V2V_HELP_LINK}>
          Learn more
        </ExternalLink>
        .
      </p>
    </ForkliftTrans>
  </>
);
