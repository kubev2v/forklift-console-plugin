import type { FC, ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';
import classNames from 'classnames';

import { Button, ButtonVariant, Flex, Icon } from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, type ThProps, Tr } from '@patternfly/react-table';

import type { AddButtonType, FieldRow } from './types';

import './FieldBuilderTable.style.scss';

type FieldBuilderTableProps<FormData extends FieldValues> = {
  headers: (Omit<ThProps, 'label'> & { label: ReactNode })[];
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
  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
    <Table
      borders={false}
      className="field-builder-table pf-m-grid-md"
      role="grid"
      variant="compact"
    >
      <Thead>
        <Tr>
          {headers.map((header, index) => (
            <Th
              key={index}
              width={header.width}
              className={classNames({ 'pf-v5-u-pl-0': index === 0 })}
            >
              {header.label}
            </Th>
          ))}
          <Th width={10} />
        </Tr>
      </Thead>

      <Tbody>
        {fieldRows.map((fieldRow, index) => (
          <Tr key={fieldRow.id}>
            {fieldRow.inputs.map((fieldInput, fieldInputIndex) => (
              <Td
                key={fieldInput.key}
                className={classNames({ 'pf-v5-u-pl-0': fieldInputIndex === 0 })}
              >
                {fieldInput}
              </Td>
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
  </Flex>
);

export default FieldBuilderTable;
