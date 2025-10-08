import type { FC, ReactNode } from 'react';

import { Button, ButtonVariant, Grid, Split, SplitItem } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

type LabelsListProps = {
  addRowText?: string;
  children: ReactNode;
  emptyStateAddRowText?: string;
  isEmpty: boolean;
  onLabelAdd: () => void;
  testId?: string;
};

const LabelsList: FC<LabelsListProps> = ({
  addRowText = null,
  children,
  emptyStateAddRowText = null,
  isEmpty,
  onLabelAdd,
  testId,
}) => {
  const { t } = useForkliftTranslation();

  const addRowTxt = addRowText ?? t('Add Label');
  const emptyStateAddRowTxt = emptyStateAddRowText ?? t('Add Label to specify qualifying nodes');
  return (
    <>
      <Grid hasGutter>{children}</Grid>
      <Split>
        <SplitItem>
          <Button
            className="pf-m-link--align-left"
            data-testid={testId}
            icon={<PlusCircleIcon />}
            onClick={() => {
              onLabelAdd();
            }}
            variant={ButtonVariant.link}
          >
            {isEmpty ? emptyStateAddRowTxt : addRowTxt}
          </Button>
        </SplitItem>
        <SplitItem isFilled />
      </Split>
    </>
  );
};

export default LabelsList;
