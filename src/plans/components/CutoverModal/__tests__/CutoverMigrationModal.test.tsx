import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react';

import './cutoverMigrationModal.mocks';

import { CUTOVER_MODE_INHERIT } from '../hooks/useCutoverFormState';

import {
  ASAP_RADIO,
  EXISTING_CUTOVER,
  getConfirmButton,
  INHERIT_RADIO,
  PAST_CUTOVER,
  queryRemoveButton,
  renderCutoverModal,
  SCHEDULED_RADIO,
  selectMode,
} from './cutoverMigrationModal.mocks';

describe('CutoverMigrationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the inherit radio only when the caller offers it', () => {
    renderCutoverModal();
    expect(screen.queryByTestId(INHERIT_RADIO)).not.toBeInTheDocument();

    renderCutoverModal({ inheritOption: true });
    expect(screen.getByTestId(INHERIT_RADIO)).toBeInTheDocument();
  });

  it('opens on the mode that describes the current state', () => {
    // No cutover of its own, inherit on offer (the VM modal): the VM is inheriting.
    renderCutoverModal({ inheritOption: true });

    expect(screen.getByTestId(INHERIT_RADIO)).toBeChecked();
  });

  it('opens on ASAP when inherit is not on offer', () => {
    // The plan modal renders no inherit radio, so inherit is not a state it can show.
    renderCutoverModal();

    expect(screen.getByTestId(ASAP_RADIO)).toBeChecked();
  });

  it('opens on scheduled, with the pickers prefilled, when a future cutover exists', () => {
    renderCutoverModal({ existingCutover: EXISTING_CUTOVER, inheritOption: true });

    expect(screen.getByTestId(SCHEDULED_RADIO)).toBeChecked();
    expect(screen.getByLabelText('Cutover date')).toBeInTheDocument();
  });

  it('opens on ASAP when the stored cutover has already passed', () => {
    renderCutoverModal({ existingCutover: PAST_CUTOVER });

    expect(screen.getByTestId(ASAP_RADIO)).toBeChecked();
  });

  it('offers Remove as a secondary action alongside Set cutover', () => {
    renderCutoverModal({ existingCutover: EXISTING_CUTOVER });

    expect(queryRemoveButton()).toBeInTheDocument();
    expect(getConfirmButton()).toHaveTextContent('Set cutover');
  });

  it('turns the primary button into Remove cutover in inherit mode', async () => {
    renderCutoverModal({
      existingCutover: EXISTING_CUTOVER,
      inheritOption: true,
      removeActionMode: CUTOVER_MODE_INHERIT,
    });

    await selectMode(INHERIT_RADIO);

    expect(getConfirmButton()).toHaveTextContent('Remove cutover');
    expect(getConfirmButton()).toBeEnabled();
  });
});
