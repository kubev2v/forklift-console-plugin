import { type FC, useState } from 'react';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import ModalForm from '@components/ModalForm/ModalForm';
import {
  Alert,
  AlertVariant,
  Checkbox,
  Flex,
  FormGroup,
  Stack,
  StackItem,
  Text,
  TextVariants,
} from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { patchGuestConversion } from './utils/patchGuestConversion';
import { getSkipGuestConversion, getUseCompatibilityMode } from './utils/utils';

const GuestConversionEditModal: FC<EditPlanProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();
  const [skipGuestConversion, setSkipGuestConversion] = useState<boolean>(
    Boolean(getSkipGuestConversion(resource)),
  );
  const [useCompatibilityMode, setUseCompatibilityMode] = useState<boolean>(
    getUseCompatibilityMode(resource) ?? true,
  );

  return (
    <ModalForm
      title={t('Guest conversion mode')}
      onConfirm={async () =>
        patchGuestConversion({ newValue: skipGuestConversion, resource, useCompatibilityMode })
      }
    >
      <Stack hasGutter>
        <StackItem>
          <Text component={TextVariants.p} className="pf-v5-u-color-200">
            {t(
              'Guest conversion uses the virt-v2v tool to modify all of the internal configurations of the VMs in the plan to make them compatible with Red Hat OpenShift Virtualization.',
            )}
          </Text>
        </StackItem>

        <StackItem>
          <FormGroup fieldId="skip-guest-conversion" className="checkbox-form-group">
            <Checkbox
              id="skip-guest-conversion-checkbox"
              label={t('Skip guest conversion')}
              isChecked={skipGuestConversion}
              onChange={(_, checked) => {
                setSkipGuestConversion(checked);
              }}
            />
          </FormGroup>

          {skipGuestConversion && (
            <Alert
              isPlain
              isInline
              variant={AlertVariant.info}
              className="pf-v5-u-mt-xs pf-v5-u-ml-lg"
              title={t(
                "If skipped, the VMs' disk data will be duplicated byte-for-byte, allowing for faster conversions. However, there is a risk that the VMs might not function properly and it is not recommended.",
              )}
            />
          )}
        </StackItem>

        {skipGuestConversion && (
          <StackItem>
            <FormGroup fieldId="use-compatibility-mode" className="checkbox-form-group">
              <Flex
                alignItems={{ default: 'alignItemsBaseline' }}
                spaceItems={{ default: 'spaceItemsNone' }}
              >
                <Checkbox
                  id="use-compatibility-mode-checkbox"
                  label={t('Use compatibility mode')}
                  isChecked={useCompatibilityMode}
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
                isPlain
                isInline
                variant={AlertVariant.warning}
                className="pf-v5-u-mt-xs pf-v5-u-ml-lg"
                title={t(
                  "If you don't use compatibility mode, you must have VirtIO drivers already installed in the source VM.",
                )}
              />
            )}
          </StackItem>
        )}
      </Stack>
    </ModalForm>
  );
};

export default GuestConversionEditModal;
