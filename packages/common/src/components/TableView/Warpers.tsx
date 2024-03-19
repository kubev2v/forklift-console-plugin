import React from 'react';

import {
  Table as PfTable,
  TableComposable as PfTableComposable,
  Tbody as PfTbody,
  Td as PfTd,
  Th as PfTh,
  Thead as PfThead,
  Tr as PfTr,
} from '@patternfly/react-table';

/*
 * This wrappers workaround a bug in @patternfly/react-table types,
 * they can be safely removed once this but is fixed.
 */

type PfTableComposableProps = React.ComponentProps<typeof PfTableComposable>;
type TableComposableProps = Omit<
  PfTableComposableProps,
  'onPointerEnterCapture' | 'onPointerLeaveCapture'
> & {
  onPointerEnterCapture?: PfTableComposableProps['onPointerEnterCapture'];
  onPointerLeaveCapture?: PfTableComposableProps['onPointerLeaveCapture'];
};

type PfTdProps = React.ComponentProps<typeof PfTd>;
type TdProps = Omit<PfTdProps, 'onPointerEnterCapture' | 'onPointerLeaveCapture'> & {
  onPointerEnterCapture?: PfTdProps['onPointerEnterCapture'];
  onPointerLeaveCapture?: PfTdProps['onPointerLeaveCapture'];
};

type PfThProps = React.ComponentProps<typeof PfTh>;
type ThProps = Omit<PfThProps, 'onPointerEnterCapture' | 'onPointerLeaveCapture'> & {
  onPointerEnterCapture?: PfThProps['onPointerEnterCapture'];
  onPointerLeaveCapture?: PfThProps['onPointerLeaveCapture'];
};

type PfTrProps = React.ComponentProps<typeof PfTr>;
type TrProps = Omit<PfTrProps, 'onPointerEnterCapture' | 'onPointerLeaveCapture'> & {
  onPointerEnterCapture?: PfTrProps['onPointerEnterCapture'];
  onPointerLeaveCapture?: PfTrProps['onPointerLeaveCapture'];
};

type PfTheadProps = React.ComponentProps<typeof PfThead>;
type TheadProps = Omit<PfTheadProps, 'onPointerEnterCapture' | 'onPointerLeaveCapture'> & {
  onPointerEnterCapture?: PfTheadProps['onPointerEnterCapture'];
  onPointerLeaveCapture?: PfTheadProps['onPointerLeaveCapture'];
};

type PfTbodyProps = React.ComponentProps<typeof PfTbody>;
type TbodyProps = Omit<PfTbodyProps, 'onPointerEnterCapture' | 'onPointerLeaveCapture'> & {
  onPointerEnterCapture?: PfTbodyProps['onPointerEnterCapture'];
  onPointerLeaveCapture?: PfTbodyProps['onPointerLeaveCapture'];
};

type PfTableProps = React.ComponentProps<typeof PfTable>;
type TableProps = Omit<PfTableProps, 'onPointerEnterCapture' | 'onPointerLeaveCapture'>;

export const Td: React.FC<TdProps> = (props) => (
  <PfTd
    {...props}
    onPointerEnterCapture={props?.onPointerEnterCapture}
    onPointerLeaveCapture={props.onPointerLeaveCapture}
  />
);

export const Tr: React.FC<TrProps> = (props) => (
  <PfTr
    {...props}
    onPointerEnterCapture={props?.onPointerEnterCapture}
    onPointerLeaveCapture={props.onPointerLeaveCapture}
  />
);

export const Th: React.FC<ThProps> = (props) => (
  <PfTh
    {...props}
    onPointerEnterCapture={props?.onPointerEnterCapture}
    onPointerLeaveCapture={props.onPointerLeaveCapture}
  />
);

export const Thead: React.FC<TheadProps> = (props) => (
  <PfThead
    {...props}
    onPointerEnterCapture={props?.onPointerEnterCapture}
    onPointerLeaveCapture={props.onPointerLeaveCapture}
  />
);

export const Tbody: React.FC<TbodyProps> = (props) => (
  <PfTbody
    {...props}
    onPointerEnterCapture={props?.onPointerEnterCapture}
    onPointerLeaveCapture={props.onPointerLeaveCapture}
  />
);

export const TableComposable: React.FC<TableComposableProps> = (props) => (
  <PfTableComposable
    {...props}
    onPointerEnterCapture={props?.onPointerEnterCapture}
    onPointerLeaveCapture={props.onPointerLeaveCapture}
  />
);

export const Table: React.FC<TableProps> = (props) => <PfTable {...props} />;
