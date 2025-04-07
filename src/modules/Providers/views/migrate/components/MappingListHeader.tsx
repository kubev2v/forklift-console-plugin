import {
  DataList,
  DataListAction,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
} from '@patternfly/react-core';

export const MappingListHeader = ({
  destinationHeading,
  sourceHeading,
}: {
  sourceHeading: string;
  destinationHeading: string;
}) => (
  <DataList isCompact aria-label="" className="forklift-page-mapping-list--header">
    <DataListItem aria-labelledby="">
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <DataListCell key="source">{sourceHeading}</DataListCell>,
            <DataListCell key="destination">{destinationHeading}</DataListCell>,
          ]}
        />
        <DataListAction aria-label="empty" id="empty" aria-labelledby="" aria-hidden>
          <div className="forklift-page-mapping-list--header-action-spacer"></div>
        </DataListAction>
      </DataListItemRow>
    </DataListItem>
  </DataList>
);
