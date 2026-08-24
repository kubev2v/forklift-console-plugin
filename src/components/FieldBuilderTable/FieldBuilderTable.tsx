import type { FC, ReactNode } from 'react';
import type { FieldValues } from 'react-hook-form';

import {
  Button,
  ButtonVariant,
  Flex,
  FormGroup,
  type FormGroupProps,
  Icon,
  Tooltip,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, type ThProps, Tr } from '@patternfly/react-table';

import type { AddButtonType, FieldRow, RemoveButtonType } from './types';

import './FieldBuilderTable.style.scss';

type FieldBuilderHeader = Omit<ThProps, 'label'> & FormGroupProps;

const toHeaderEntries = (
  headers: FieldBuilderHeader[],
): { header: FieldBuilderHeader; key: string }[] => {
  const seen = new Map<string, number>();

  return headers.map((header) => {
    const base =
      typeof header.label === 'string' || typeof header.label === 'number'
        ? String(header.label)
        : 'field-header';
    const occurrence = seen.get(base) ?? 0;
    seen.set(base, occurrence + 1);

    return {
      header,
      key: occurrence === 0 ? base : `${base}__${occurrence}`,
    };
  });
};

type FieldBuilderTableProps<FormData extends FieldValues> = {
  addButton: AddButtonType;
  fieldRows: FieldRow<FormData>[];
  headers: FieldBuilderHeader[];
  removeButton: RemoveButtonType;
};

const FieldBuilderTable: FC<FieldBuilderTableProps<FormData>> = ({
  addButton,
  fieldRows,
  headers,
  removeButton,
}) => {
  const totalColSpan = headers.length + 1; // +1 for action column

  return (
    <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
      <Table
        borders={false}
        className="field-builder-table pf-m-grid-md"
        role="grid"
        variant="compact"
      >
        <Thead>
          <Tr>
            {toHeaderEntries(headers).map(({ header, key }) => (
              <Th key={key} width={header.width}>
                <FormGroup {...header} hasNoPaddingTop />
              </Th>
            ))}
            {/* Action column for remove buttons */}
            <Th width={10} />
          </Tr>
        </Thead>

        <Tbody>
          {fieldRows.reduce<ReactNode[]>((acc, fieldRow, rowIndex) => {
            // Main row containing field inputs and remove button
            const removeButtonTip = removeButton.tooltip?.(rowIndex);
            const button = (
              <Button
                data-testid={`remove-row-${rowIndex}`}
                icon={
                  <Icon size="md">
                    <MinusCircleIcon />
                  </Icon>
                }
                isDisabled={removeButton.isDisabled?.(rowIndex)}
                isInline
                onClick={() => {
                  removeButton.onClick(rowIndex);
                }}
                variant={ButtonVariant.plain}
              />
            );

            acc.push(
              <Tr data-testid={`field-row-${rowIndex}`} key={fieldRow.id}>
                {fieldRow.inputs.map((fieldInput) => (
                  <Td key={fieldInput.key}>{fieldInput}</Td>
                ))}

                {/* Remove button cell */}
                <Td isActionCell>
                  {removeButtonTip ? (
                    <Tooltip content={removeButtonTip}>
                      <span>{button}</span>
                    </Tooltip>
                  ) : (
                    button
                  )}
                </Td>
              </Tr>,
            );

            // Conditionally add additional options row if it exists
            if (fieldRow.additionalOptions) {
              acc.push(
                <Tr key={`${fieldRow.id}-additional`}>
                  <Td colSpan={totalColSpan}>{fieldRow.additionalOptions}</Td>
                </Tr>,
              );
            }

            return acc;
          }, [])}
        </Tbody>
      </Table>

      <Button
        data-testid="add-mapping-button"
        icon={<PlusCircleIcon />}
        isDisabled={addButton.isDisabled}
        isInline
        onClick={addButton.onClick}
        variant={ButtonVariant.link}
      >
        {addButton.label}
      </Button>
    </Flex>
  );
};

export default FieldBuilderTable;
