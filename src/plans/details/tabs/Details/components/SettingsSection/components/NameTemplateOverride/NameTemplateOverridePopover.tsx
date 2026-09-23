import { type FC, useCallback, useState } from 'react';
import type { NameTemplateType } from 'src/plans/details/utils/nameTemplateOverrides';

import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Label,
  List,
  ListItem,
  Popover,
  Stack,
  StackItem,
  Tooltip,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type NameTemplateOverridePopoverProps = {
  canApply: boolean;
  onApply: () => Promise<unknown>;
  templateType: NameTemplateType;
  triggerLabel: string;
  vmNames: string[];
};

const NameTemplateOverridePopover: FC<NameTemplateOverridePopoverProps> = ({
  canApply,
  onApply,
  templateType,
  triggerLabel,
  vmNames,
}) => {
  const { t } = useForkliftTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = useCallback(async (): Promise<void> => {
    if (!canApply || isApplying) {
      return;
    }

    setIsApplying(true);
    setError(null);

    try {
      await onApply();
    } catch (err) {
      setError((err as Error)?.message ?? String(err));
    } finally {
      setIsApplying(false);
    }
  }, [canApply, isApplying, onApply]);

  const applyButton = (
    <Button
      data-testid={`name-template-override-apply-${templateType}`}
      isDisabled={!canApply || isApplying}
      isInline
      isLoading={isApplying}
      onClick={() => {
        handleApply().catch(() => undefined);
      }}
      variant={ButtonVariant.link}
    >
      {t('Apply plan setting to all VMs')}
    </Button>
  );

  return (
    <Popover
      aria-label={t('Virtual machines with a custom name template')}
      bodyContent={
        <Stack hasGutter>
          <StackItem>{t('The following virtual machines override this plan setting:')}</StackItem>
          <StackItem>
            <List>
              {vmNames.map((name) => (
                <ListItem key={name}>{name}</ListItem>
              ))}
            </List>
          </StackItem>
          {error ? (
            <StackItem>
              <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
                {t('{{errorMessage}}', { errorMessage: error })}
              </Alert>
            </StackItem>
          ) : null}
        </Stack>
      }
      footerContent={
        canApply || isApplying ? (
          applyButton
        ) : (
          <Tooltip content={t('You do not have permission to edit this plan.')}>
            <span>{applyButton}</span>
          </Tooltip>
        )
      }
      headerContent={t('Custom name templates')}
      triggerAction="hover"
    >
      <Button
        aria-label={t('Virtual machines with a custom name template')}
        className="pf-v6-u-p-0"
        data-testid={`name-template-override-trigger-${templateType}`}
        isInline
        variant={ButtonVariant.plain}
      >
        <Label color="grey" isCompact>
          {triggerLabel}
        </Label>
      </Button>
    </Popover>
  );
};

export default NameTemplateOverridePopover;
