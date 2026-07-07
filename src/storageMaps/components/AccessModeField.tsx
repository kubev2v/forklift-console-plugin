import { type FC, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import Select from '@components/common/Select';
import {
  ExpandableSection,
  Form,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { ACCESS_MODE, type AccessMode, type TargetStorage } from '@utils/storage/types';

import { getAccessModeOptions, isRwxCapableProvisioner } from '../utils/constants';

import './OffloadStorageIndexedForm/OffloadStorageIndexedForm.style.scss';

type AccessModeFieldProps = {
  fieldId: string;
  targetStorages: TargetStorage[];
  targetStorageFieldId: string;
};

const AccessModeField: FC<AccessModeFieldProps> = ({
  fieldId,
  targetStorageFieldId,
  targetStorages,
}) => {
  const {
    control,
    formState: { isSubmitting },
    trigger,
  } = useFormContext();
  const { t } = useForkliftTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const accessMode = useWatch({ control, name: fieldId }) as AccessMode | undefined;
  const targetStorageValue = useWatch({ control, name: targetStorageFieldId }) as
    | { name?: string }
    | string
    | undefined;

  const selectedProvisioner = targetStorages.find(
    (storage) =>
      storage.name ===
      (typeof targetStorageValue === 'object' ? targetStorageValue?.name : targetStorageValue),
  )?.provisioner;

  const showRwoWarning =
    accessMode === ACCESS_MODE.ReadWriteOnce &&
    selectedProvisioner !== undefined &&
    isRwxCapableProvisioner(selectedProvisioner);

  return (
    <div className="offload-storage">
      <Split className="offload-storage__header">
        <SplitItem isFilled>
          <ExpandableSection
            toggleText={t('Advanced options (optional)')}
            onToggle={(_e, expanded) => {
              setIsExpanded(expanded);
            }}
            isExpanded={isExpanded}
          >
            <Form className="offload-storage__form">
              <FormGroupWithHelpText
                fieldId={fieldId}
                label={t('Access mode')}
                labelHelp={
                  <HelpIconPopover>
                    {t(
                      'ReadWriteOnce (RWO): A volume can be mounted as read-write by a single node. This does not support live migration. ReadWriteMany (RWX): A volume can be mounted as read-write by many nodes. This is required for live migration of OpenShift Virtualization VMs, as it allows the disk to be accessed concurrently by both the source and target nodes during the migration process. Ensure your chosen StorageClass supports RWX if live migration is desired.',
                    )}
                  </HelpIconPopover>
                }
              >
                <Controller
                  name={fieldId}
                  control={control}
                  render={({ field }) => (
                    <Select
                      ref={field.ref}
                      id={fieldId}
                      options={getAccessModeOptions(t)}
                      onSelect={async (_, value) => {
                        field.onChange(
                          (value as string) === '' ? undefined : (value as AccessMode),
                        );
                        await trigger();
                      }}
                      placeholder={t('Select access mode')}
                      testId={fieldId}
                      isDisabled={isSubmitting}
                      value={(field.value as AccessMode | undefined) ?? ''}
                    />
                  )}
                />
                {showRwoWarning && (
                  <FormHelperText>
                    <HelperText>
                      <HelperTextItem variant="warning">
                        {t(
                          'ReadWriteOnce may prevent Live Migration. This storage class supports ReadWriteMany.',
                        )}
                      </HelperTextItem>
                    </HelperText>
                  </FormHelperText>
                )}
              </FormGroupWithHelpText>
            </Form>
          </ExpandableSection>
        </SplitItem>
        <SplitItem
          className="offload-storage__clear-button-container"
          style={{ visibility: 'hidden' }}
          aria-hidden="true"
        >
          {t('Clear offload options')}
        </SplitItem>
      </Split>
    </div>
  );
};

export default AccessModeField;
