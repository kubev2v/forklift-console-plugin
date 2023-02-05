import * as React from 'react';
import * as yup from 'yup';
import { Button, TextContent, Text, Grid, GridItem, Bullseye, Flex } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { MappingType, MappingSource, MappingTarget } from 'legacy/src/queries/types';
import { LineArrow } from 'legacy/src/common/components/LineArrow';
import { MappingSourceSelect } from './MappingSourceSelect';
import { MappingTargetSelect } from './MappingTargetSelect';
import { getMappingSourceTitle, getMappingTargetTitle } from '../helpers';
import { ConditionalTooltip } from 'legacy/src/common/components/ConditionalTooltip';

import './MappingBuilder.css';
import { ProviderType } from 'legacy/src/common/constants';
import { getStorageTitle } from 'legacy/src/common/helpers';
import { TruncatedText } from 'legacy/src/common/components/TruncatedText';

export interface IMappingBuilderItem {
  source: MappingSource | null;
  target: MappingTarget | null;
}

export const mappingBuilderItemsSchema = yup
  .array<IMappingBuilderItem>()
  .required()
  .min(1)
  .test('no-empty-selections', 'All sources must be mapped to a target.', (builderItems) =>
    builderItems ? builderItems.every((item) => item.source && item.target) : false
  );

interface IMappingBuilderProps {
  mappingType: MappingType;
  sourceProviderType: ProviderType;
  availableSources: MappingSource[];
  availableTargets: MappingTarget[];
  builderItems: IMappingBuilderItem[];
  setBuilderItems: (groups: IMappingBuilderItem[]) => void;
  isWizardMode?: boolean;
}

export const MappingBuilder: React.FunctionComponent<IMappingBuilderProps> = ({
  mappingType,
  sourceProviderType,
  availableSources,
  availableTargets,
  builderItems,
  setBuilderItems,
  isWizardMode = false,
}: IMappingBuilderProps) => {
  const reset = () => setBuilderItems([{ source: null, target: null }]);
  const isReset = builderItems.length === 1 && !builderItems[0].source && !builderItems[0].target;
  const addEmptyItem = () => setBuilderItems([...builderItems, { source: null, target: null }]);
  const removeItem = (itemIndex: number) => {
    if (builderItems.length > 1) {
      setBuilderItems(builderItems.filter((_item, index) => index !== itemIndex));
    } else {
      reset();
    }
  };

  let instructionText = '';
  if (mappingType === MappingType.Network) {
    if (isWizardMode) {
      instructionText = 'Select target networks.';
    } else {
      instructionText = 'Map source and target networks.';
    }
    instructionText = `${instructionText} The OpenShift pod network is the default target network. You can select a different target network from the network list.`;
  }
  if (mappingType === MappingType.Storage) {
    if (isWizardMode) {
      instructionText = 'Select target storage classes.';
    } else {
      instructionText = `Map source ${getStorageTitle(
        sourceProviderType
      )} to target storage classes.`;
    }
  }

  return (
    <>
      <TextContent>
        <Text component="p">{instructionText}</Text>
      </TextContent>
      {builderItems.map((item, itemIndex) => {
        const key = item.source ? item.source.path : 'empty';
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
                <GridItem span={isWizardMode ? 2 : 1} />
                <GridItem span={5} className={spacing.pbSm}>
                  <label className="pf-c-form__label">
                    <span className="pf-c-form__label-text">
                      {getMappingTargetTitle(mappingType)}
                    </span>
                  </label>
                </GridItem>
                {isWizardMode ? null : <GridItem span={1} />}
              </>
            ) : null}
            <GridItem span={5} className={`mapping-builder-box ${spacing.pSm}`}>
              {isWizardMode && item.source ? (
                <Bullseye style={{ justifyContent: 'left' }} className={spacing.plSm}>
                  <TextContent>
                    <TruncatedText>{item.source.name}</TruncatedText>
                    {item.source.path ? (
                      <TruncatedText>
                        <Text
                          component="small"
                          style={{ fontSize: 'var(--pf-global--FontSize--xs)' }}
                        >
                          {item.source.path}
                        </Text>
                      </TruncatedText>
                    ) : null}
                  </TextContent>
                </Bullseye>
              ) : (
                <MappingSourceSelect
                  id={`mapping-source-for-${key}`}
                  builderItems={builderItems}
                  itemIndex={itemIndex}
                  setBuilderItems={setBuilderItems}
                  availableSources={availableSources}
                  // Maybe use these instead of extraSelectMargin if we can get it to be dynamic to always fit the screen
                  //menuAppendTo="parent"
                  //maxHeight="200px"
                />
              )}
            </GridItem>
            <GridItem span={isWizardMode ? 2 : 1}>
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
            {isWizardMode ? null : (
              <GridItem span={1}>
                <Bullseye>
                  <Button
                    variant="plain"
                    aria-label="Remove mapping"
                    onClick={() => removeItem(itemIndex)}
                    isDisabled={isReset}
                  >
                    <TrashIcon />
                  </Button>
                </Bullseye>
              </GridItem>
            )}
          </Grid>
        );
      })}
      {isWizardMode ? null : (
        <Flex
          justifyContent={{ default: 'justifyContentCenter' }}
          spaceItems={{ default: 'spaceItemsMd' }}
        >
          {builderItems.every((item) => item.source && item.target) ? (
            <ConditionalTooltip
              isTooltipEnabled={builderItems.length === availableSources.length}
              content={`All source ${
                mappingType === MappingType.Network
                  ? 'networks'
                  : getStorageTitle(sourceProviderType)
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
          <Button variant="secondary" onClick={reset} isDisabled={isReset}>
            Remove all
          </Button>
        </Flex>
      )}
    </>
  );
};
