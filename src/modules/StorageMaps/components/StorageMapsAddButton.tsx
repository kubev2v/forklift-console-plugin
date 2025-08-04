import { type FC, type Ref, useState } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModelRef } from '@kubev2v/types';
import {
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';

const StorageMapsAddButton: FC<{ namespace?: string; testId?: string }> = ({
  namespace,
  testId,
}) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const storageMapsListUrl = getResourceUrl({
    namespace,
    namespaced: namespace !== undefined,
    reference: StorageMapModelRef,
  });

  return (
    <Dropdown
      isOpen={isMenuOpen}
      onOpenChange={(isOpen: boolean) => {
        setIsMenuOpen(isOpen);
      }}
      data-testid={testId}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
          isExpanded={isMenuOpen}
          variant={ButtonVariant.primary}
        >
          {t('Create storage map')}
        </MenuToggle>
      )}
      shouldFocusFirstItemOnOpen={false}
      popperProps={{
        position: 'right',
      }}
    >
      <DropdownList>
        <DropdownItem
          key="form"
          onClick={() => {
            navigate(`/k8s/storageMaps/create/form`);
          }}
        >
          {t('Create with form')}
        </DropdownItem>

        <DropdownItem
          key="yaml"
          onClick={() => {
            navigate(`${storageMapsListUrl}/~new`);
          }}
        >
          {t('Create with YAML')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default StorageMapsAddButton;
