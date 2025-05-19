import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { Alert, PageSection } from '@patternfly/react-core';
import { BellIcon } from '@patternfly/react-icons';
import { getName } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

type HeaderSectionProps = {
  provider: V1beta1Provider;
  vmData: VmData[];
};

const HeaderSection: FC<HeaderSectionProps> = ({ provider, vmData }) => {
  const { t } = useForkliftTranslation();

  const name = getName(provider);

  return (
    <ModalHOC>
      <PageSection variant="light" className="forklift-page-section--info">
        {!isEmpty(vmData) && (
          <Alert
            customIcon={<BellIcon />}
            variant="info"
            title={t('How to create a migration plan')}
          >
            <ForkliftTrans>
              To migrate virtual machines from <strong>{name}</strong> provider, select the virtual
              machines to migrate from the list of available virtual machines and click the{' '}
              <strong>Create migration plan</strong> button.
            </ForkliftTrans>
          </Alert>
        )}
      </PageSection>
    </ModalHOC>
  );
};

export default HeaderSection;
