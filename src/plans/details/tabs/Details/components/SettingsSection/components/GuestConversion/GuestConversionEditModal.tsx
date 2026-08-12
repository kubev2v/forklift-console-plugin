import { useState } from 'react';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import {
  Alert,
  AlertVariant,
  Checkbox,
  Content,
  ContentVariants,
  Flex,
  FormGroup,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { patchGuestConversion } from './utils/patchGuestConversion';
import { getSkipGuestConversion, getUseCompatibilityMode } from './utils/utils';

const GuestConversionEditModal: ModalComponent<EditPlanProps> = ({ resource, ...rest }) => {
  const { t } = useForkliftTranslation();
  const [skipGuestConversion, setSkipGuestConversion] = useState<boolean>(
    Boolean(getSkipGuestConversion(resource)),
  );
  const [useCompatibilityMode, setUseCompatibilityMode] = useState<boolean>(
    getUseCompatibilityMode(resource) ?? true,
  );

  return (
    <ModalForm
      onConfirm={async () =>
        patchGuestConversion({
          newValue: skipGuestConversion,
          resource,
          useCompatibilityMode,
        })
      }
      testId="guest-conversion-mode-modal"
      title={t('Guest conversion mode')}
      {...rest}
    >
      <Stack hasGutter>
        <StackItem>
          <Content className="pf-v6-u-color-200" component={ContentVariants.p}>
            {t(
              'Guest conversion uses the virt-v2v tool to modify all of the internal configurations of the VMs in the plan to make them compatible with Red Hat OpenShift Virtualization.',
            )}
          </Content>
        </StackItem>

        <StackItem>
          <FormGroup className="checkbox-form-group" fieldId="skip-guest-conversion">
            <Checkbox
              data-testid="skip-guest-conversion-checkbox"
              id="skip-guest-conversion-checkbox"
              isChecked={skipGuestConversion}
              label={t('Skip guest conversion')}
              onChange={(_, checked) => {
                setSkipGuestConversion(checked);
              }}
            />
          </FormGroup>

          {skipGuestConversion && (
            <Alert
              className="pf-v6-u-mt-xs pf-v6-u-ml-lg"
              isInline
              isPlain
              title={t(
                "If skipped, the VMs' disk data will be duplicated byte-for-byte, allowing for faster conversions. However, there is a risk that the VMs might not function properly and it is not recommended.",
              )}
              variant={AlertVariant.info}
            />
          )}
        </StackItem>

        {skipGuestConversion && (
          <StackItem>
            <FormGroup className="checkbox-form-group" fieldId="use-compatibility-mode">
              <Flex
                alignItems={{ default: 'alignItemsBaseline' }}
                spaceItems={{ default: 'spaceItemsNone' }}
              >
                <Checkbox
                  data-testid="use-compatibility-mode-checkbox"
                  id="use-compatibility-mode-checkbox"
                  isChecked={useCompatibilityMode}
                  label={t('Use compatibility mode')}
                  onChange={(_, checked) => {
                    setUseCompatibilityMode(checked);
                  }}
                />

                <HelpIconPopover>
                  <ForkliftTrans>
                    <Stack hasGutter>
                      <StackItem>
                        If checked, compatibility devices (SATA bus, E1000E NIC) will be used to
                        ensure boot-ability.
                      </StackItem>

                      <StackItem>
                        If unchecked, high-performance VirtIO devices will be used. This requires
                        VirtIO drivers already installed in the source VM.
                      </StackItem>
                    </Stack>
                  </ForkliftTrans>
                </HelpIconPopover>
              </Flex>
            </FormGroup>

            {!useCompatibilityMode && (
              <Alert
                className="pf-v6-u-mt-xs pf-v6-u-ml-lg"
                isInline
                isPlain
                title={t(
                  "If you don't use compatibility mode, you must have VirtIO drivers already installed in the source VM.",
                )}
                variant={AlertVariant.warning}
              />
            )}
          </StackItem>
        )}
      </Stack>
    </ModalForm>
  );
};

export default GuestConversionEditModal;
