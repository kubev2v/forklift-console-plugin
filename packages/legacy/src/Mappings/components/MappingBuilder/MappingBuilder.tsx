import * as React from 'react';
import * as yup from 'yup';
import { Button, TextContent, Text, Grid, GridItem, Bullseye, Flex } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import {
  MappingType,
  MappingSource,
  MappingTarget,
  POD_NETWORK,
  IAnnotatedStorageClass,
  ISourceNetwork,
  ISourceStorage,
} from 'legacy/src/queries/types';
import { LineArrow } from 'legacy/src/common/components/LineArrow';
import { MappingSourceSelect } from './MappingSourceSelect';
import { MappingTargetSelect } from './MappingTargetSelect';
import { getMappingSourceTitle, getMappingTargetTitle } from '../helpers';
import { ConditionalTooltip } from 'legacy/src/common/components/ConditionalTooltip';

import './MappingBuilder.css';
import { ProviderType } from 'legacy/src/common/constants';
import { getStorageTitle } from 'legacy/src/common/helpers';

export interface IMappingBuilderItem {
  source: MappingSource | null;
  target: MappingTarget | null;
}

export const mappingBuilderItemsSchema = yup
  .array<IMappingBuilderItem>()
  .required()
  .min(0)
  .test('no-empty-selections', 'All sources must be mapped to a target.', (builderItems) =>
    builderItems.every((item) => item.source && item.target)
  );

interface IMappingBuilderProps {
  mappingType: MappingType;
  sourceProviderType: ProviderType;
  availableSources: MappingSource[];
  availableTargets: MappingTarget[];
  builderItems: IMappingBuilderItem[];
  setBuilderItems: (groups: IMappingBuilderItem[]) => void;
}

export const getDefaultTarget = (availableTargets: MappingTarget[], mappingType: MappingType) =>
  mappingType === MappingType.Network
    ? POD_NETWORK
    : availableTargets.find((target) => (target as IAnnotatedStorageClass).uiMeta.isDefault) ||
      null;

export const MappingBuilder: React.FunctionComponent<IMappingBuilderProps> = ({
  mappingType,
  sourceProviderType,
  availableSources,
  availableTargets,
  builderItems,
  setBuilderItems,
}: IMappingBuilderProps) => {
  const reset = () => setBuilderItems([]);
  const addEmptyItem = () =>
    setBuilderItems([
      ...builderItems,
      { source: null, target: getDefaultTarget(availableTargets, mappingType) },
    ]);
  const removeItem = (itemIndex: number) => {
    if (builderItems.length > 1) {
      setBuilderItems(builderItems.filter((_item, index) => index !== itemIndex));
    } else {
      reset();
    }
  };

  let instructionText = '';
  if (mappingType === MappingType.Network) {
    instructionText = `Map source and target networks. The OpenShift pod network is the default target network. You can select a different target network from the network list.`;
  }
  if (mappingType === MappingType.Storage) {
    instructionText = `Map source ${getStorageTitle(
      sourceProviderType
    )} to target storage classes.`;
  }

  return (
    <>
      <TextContent>
        <Text component="p">{instructionText}</Text>
      </TextContent>
      {builderItems.map((item, itemIndex) => {
        const key = item.source
          ? (item.source as ISourceNetwork).path || (item.source as ISourceStorage).path || ''
          : 'empty';
        return (
          <Grid key={key}>
            {itemIndex === 0 ? (
              <>
                <GridItem span={5} className={spacing.pbSm}>
                  <label className="pf-c-form__label">
                    <span className="pf-c-form__label-text">
                      {getMappingSourceTitle(mappingType, sourceProviderType)}
                    </span>
                  </label>
                </GridItem>
                <GridItem span={1} />
                <GridItem span={5} className={spacing.pbSm}>
                  <label className="pf-c-form__label">
                    <span className="pf-c-form__label-text">
                      {getMappingTargetTitle(mappingType)}
                    </span>
                  </label>
                </GridItem>
                <GridItem span={1} />
              </>
            ) : null}
            <GridItem span={5} className={`mapping-builder-box ${spacing.pSm}`}>
              <MappingSourceSelect
                id={`mapping-source-for-${key}`}
                builderItems={builderItems}
                itemIndex={itemIndex}
                setBuilderItems={setBuilderItems}
                availableSources={availableSources}
                mappingType={mappingType}
                // Maybe use these instead of extraSelectMargin if we can get it to be dynamic to always fit the screen
                //menuAppendTo="parent"
                //maxHeight="200px"
              />
            </GridItem>
            <GridItem span={1}>
              <Bullseye>
                <LineArrow />
              </Bullseye>
            </GridItem>
            <GridItem span={5} className={`mapping-builder-box ${spacing.pSm}`}>
              <Bullseye style={{ justifyContent: 'left' }} className={spacing.plSm}>
                <MappingTargetSelect
                  id={`mapping-target-for-${key}`}
                  builderItems={builderItems}
                  itemIndex={itemIndex}
                  setBuilderItems={setBuilderItems}
                  availableTargets={availableTargets}
                  mappingType={mappingType}
                  // Maybe use these instead of extraSelectMargin if we can get it to be dynamic to always fit the screen
                  //menuAppendTo="parent"
                  //maxHeight="200px"
                />
              </Bullseye>
            </GridItem>
            <GridItem span={1}>
              <Bullseye>
                <Button
                  variant="plain"
                  aria-label="Remove mapping"
                  onClick={() => removeItem(itemIndex)}
                >
                  <TrashIcon />
                </Button>
              </Bullseye>
            </GridItem>
          </Grid>
        );
      })}
      <Flex
        justifyContent={{ default: 'justifyContentCenter' }}
        spaceItems={{ default: 'spaceItemsMd' }}
      >
        {builderItems.every((item) => item.source && item.target) ? (
          <ConditionalTooltip
            isTooltipEnabled={builderItems.length === availableSources.length}
            content={`All source ${
              mappingType === MappingType.Network ? 'networks' : getStorageTitle(sourceProviderType)
            } have been mapped.`}
            position="bottom"
          >
            <div>
              <Button
                isDisabled={builderItems.length === availableSources.length}
                variant="secondary"
                icon={<PlusCircleIcon />}
                onClick={addEmptyItem}
              >
                Add
              </Button>
            </div>
          </ConditionalTooltip>
        ) : null}
        <Button variant="secondary" onClick={reset}>
          Remove all
        </Button>
      </Flex>
    </>
  );
};
