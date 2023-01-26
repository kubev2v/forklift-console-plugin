import * as React from 'react';
import { Grid, GridItem, Text, TextContent } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import text from '@patternfly/react-styles/css/utilities/Text/text';

import { Mapping, MappingType } from 'legacy/src/queries/types';
import { LineArrow } from 'legacy/src/common/components/LineArrow';
import { useResourceQueriesForMapping } from 'legacy/src/queries';
import { TruncatedText } from 'legacy/src/common/components/TruncatedText';
import { ResolvedQueries } from 'legacy/src/common/components/ResolvedQuery';
import { getMappingSourceByRef, getMappingSourceTitle, getMappingTargetTitle } from '../helpers';
import { getMappingItemTargetName, groupMappingItemsByTarget } from './helpers';

import './MappingDetailView.css';
import { ProviderType } from 'legacy/src/common/constants';

interface IMappingDetailViewProps {
  mappingType: MappingType;
  sourceProviderType?: ProviderType;
  mapping: Mapping | null;
  className?: string;
}

export const MappingDetailView: React.FunctionComponent<IMappingDetailViewProps> = ({
  mappingType,
  sourceProviderType,
  mapping,
  className = '',
}: IMappingDetailViewProps) => {
  const mappingResourceQueries = useResourceQueriesForMapping(mappingType, mapping);
  const mappingItemGroups = groupMappingItemsByTarget(
    mapping?.spec.map || [],
    mappingType,
    mappingResourceQueries.availableTargets
  );

  return (
    <ResolvedQueries
      results={mappingResourceQueries.queries}
      errorTitles={[
        'Cannot load providers',
        'Cannot load source provider resources',
        'Cannot load target provider resources',
      ]}
      className={className}
    >
      <div className={className}>
        <Grid>
          <GridItem span={5} className={spacing.pbSm}>
            <Text className={text.fontWeightBold}>
              {getMappingSourceTitle(mappingType, sourceProviderType)}
            </Text>
          </GridItem>
          <GridItem span={2} />
          <GridItem span={5} className={spacing.pbSm}>
            <Text className={text.fontWeightBold}>{getMappingTargetTitle(mappingType)}</Text>
          </GridItem>
        </Grid>
        {mappingItemGroups.map((items, itemGroupIndex) => {
          const targetName = getMappingItemTargetName(
            items[0],
            mappingType,
            mappingResourceQueries.availableTargets
          );
          const isLastGroup = itemGroupIndex === mappingItemGroups.length - 1;
          return (
            <Grid key={targetName} className={!isLastGroup ? spacing.mbLg : ''}>
              <GridItem span={5} className={`mapping-view-box ${spacing.pSm}`}>
                <ul>
                  {items.map((item, itemIndex) => {
                    const source = getMappingSourceByRef(
                      mappingResourceQueries.availableSources,
                      item.source
                    );
                    const sourceName = source ? source.name : '';
                    return (
                      <li
                        key={`${sourceName}-${source?.path || ''}`}
                        className={itemIndex !== items.length - 1 ? spacing.mbSm : ''}
                      >
                        <TextContent>
                          <TruncatedText>
                            {sourceName || <span className="missing-item">Not available</span>}
                          </TruncatedText>
                          {source?.path ? (
                            <TruncatedText>
                              <Text
                                component="small"
                                style={{ fontSize: 'var(--pf-global--FontSize--xs)' }}
                              >
                                {source.path}
                              </Text>
                            </TruncatedText>
                          ) : null}
                        </TextContent>
                      </li>
                    );
                  })}
                </ul>
              </GridItem>
              <GridItem span={2} className="mapping-view-arrow-cell">
                <LineArrow />
              </GridItem>
              <GridItem span={5} className={`mapping-view-box ${spacing.pSm}`}>
                <TruncatedText>
                  {targetName || <span className="missing-item">Not available</span>}
                </TruncatedText>
              </GridItem>
            </Grid>
          );
        })}
      </div>
    </ResolvedQueries>
  );
};
