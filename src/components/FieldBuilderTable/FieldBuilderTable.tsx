import type { FC } from 'react';
import type { FieldValues } from 'react-hook-form';

import { Button, ButtonVariant, Icon, Stack } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, type ThProps, Tr } from '@patternfly/react-table';

import type { AddButtonType, FieldRow } from './types';

import './FieldBuilderTable.style.scss';

type FieldBuilderTableProps<FormData extends FieldValues> = {
  headers: ThProps[];
  fieldRows: FieldRow<FormData>[];
  addButton: AddButtonType;
  onRemove: (fieldIndex: number) => void;
};

const FieldBuilderTable: FC<FieldBuilderTableProps<FormData>> = ({
  addButton,
  fieldRows,
  headers,
  onRemove,
}) => (
  <Stack hasGutter>
    <Table className="field-builder-table pf-m-grid-md" role="grid" variant="compact">
      <Thead>
        <Tr>
          {headers.map((header, index) => (
            <Th key={index} width={header.width}>
              {header.label}
            </Th>
          ))}
          <Th width={10} />
        </Tr>
      </Thead>

      <Tbody>
        {fieldRows.map((fieldRow, index) => (
          <Tr key={fieldRow.id}>
            {fieldRow.inputs.map((fieldInput) => (
              <Td key={fieldInput.key}>{fieldInput}</Td>
            ))}

            <Td isActionCell>
              <Button
                icon={
                  <Icon size="md">
                    <MinusCircleIcon />
                  </Icon>
                }
                isInline
                variant={ButtonVariant.plain}
                onClick={() => {
                  onRemove(index);
                }}
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>

    <Button
      isInline
      variant={ButtonVariant.link}
      icon={<PlusCircleIcon />}
      isDisabled={addButton.isDisabled}
      onClick={addButton.onClick}
    >
      {addButton.label}
    </Button>
  </Stack>
);

export default FieldBuilderTable;
