import * as React from 'react';
import {
  PageSection,
  Title,
  Level,
  LevelItem,
  Tabs,
  Tab,
  TabTitleText,
} from '@patternfly/react-core';
import { Mapping, MappingType } from 'legacy/src/queries/types';
import { CreateMappingButton } from 'legacy/src/Mappings/components/CreateMappingButton';
import { AddEditMappingModal } from 'legacy/src/Mappings/components/AddEditMappingModal';
import { Mappings } from 'legacy/src/Mappings/Mappings';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

const MappingsPage: React.FunctionComponent = () => {
  const defaultMappingType = MappingType.Network;
  const [activeMapType, setActiveMapType] = React.useState(defaultMappingType);

  const handleTabSelect = (event: React.MouseEvent, tabIndex: React.ReactText) => {
    setActiveMapType(MappingType[tabIndex]);
  };

  const [isAddEditModalOpen, toggleAddEditModal] = React.useReducer((isOpen) => !isOpen, false);
  const [mappingBeingEdited, setMappingBeingEdited] = React.useState<Mapping | null>(null);

  const toggleModalAndResetEdit = () => {
    setMappingBeingEdited(null);
    toggleAddEditModal();
  };

  const openEditMappingModal = (mapping: Mapping) => {
    setMappingBeingEdited(mapping);
    toggleAddEditModal();
  };

  return (
    <>
      <PageSection variant="light" className={spacing.pb_0}>
        <Level>
          <LevelItem>
            <Title headingLevel="h1">Mappings</Title>
          </LevelItem>
          <LevelItem>
            <CreateMappingButton
              aria-label={`Create ${activeMapType} mapping`}
              variant="primary"
              label="Create mapping"
              onClick={toggleModalAndResetEdit}
            />
          </LevelItem>
        </Level>

        <Tabs className={spacing.mtSm} activeKey={activeMapType} onSelect={handleTabSelect}>
          <Tab eventKey={MappingType.Network} title={<TabTitleText>Network</TabTitleText>} />
          <Tab eventKey={MappingType.Storage} title={<TabTitleText>Storage</TabTitleText>} />
        </Tabs>
      </PageSection>

      <PageSection>
        <Mappings
          mappingType={MappingType[activeMapType]}
          key={activeMapType.toLowerCase()}
          toggleModalAndResetEdit={toggleModalAndResetEdit}
          openEditMappingModal={openEditMappingModal}
        />
      </PageSection>

      {isAddEditModalOpen ? (
        <AddEditMappingModal
          title={`${!mappingBeingEdited ? 'Create' : 'Edit'} mapping`}
          onClose={toggleModalAndResetEdit}
          mappingType={MappingType[activeMapType]}
          mappingBeingEdited={mappingBeingEdited}
          setActiveMapType={setActiveMapType}
        />
      ) : null}
    </>
  );
};
export { MappingsPage };
