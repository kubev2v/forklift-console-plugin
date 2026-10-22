import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import CutoverMigrationModal from '../CutoverMigrationModal';
import { CUTOVER_MODE_SCHEDULED, type CutoverMode } from '../hooks/useCutoverFormState';

export const ASAP_RADIO = 'cutover-mode-asap';
export const SCHEDULED_RADIO = 'cutover-mode-scheduled';
export const INHERIT_RADIO = 'cutover-mode-inherit';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const EXISTING_CUTOVER = new Date(Date.now() + ONE_DAY_MS).toISOString();
export const PAST_CUTOVER = new Date(Date.now() - ONE_DAY_MS).toISOString();

type RenderOptions = {
  existingCutover?: string;
  inheritOption?: boolean;
  removeActionMode?: CutoverMode;
  withRemoveHandler?: boolean;
};

type RenderResult = {
  closeOverlay: jest.Mock<() => void>;
  onRemoveCutover: jest.Mock<() => Promise<unknown>>;
  onSetCutover: jest.Mock<(cutover: string) => Promise<unknown>>;
};

export const renderCutoverModal = ({
  existingCutover,
  inheritOption,
  removeActionMode = CUTOVER_MODE_SCHEDULED,
  withRemoveHandler = true,
}: RenderOptions = {}): RenderResult => {
  const closeOverlay = jest.fn<() => void>();
  const onRemoveCutover = jest.fn<() => Promise<unknown>>(() => Promise.resolve(undefined));
  const onSetCutover = jest.fn<(cutover: string) => Promise<unknown>>(() =>
    Promise.resolve(undefined),
  );

  render(
    <CutoverMigrationModal
      closeOverlay={closeOverlay}
      description={<div data-testid="cutover-description" />}
      existingCutover={existingCutover}
      inheritOption={inheritOption}
      onRemoveCutover={onRemoveCutover}
      onSetCutover={onSetCutover}
      removeActionMode={removeActionMode}
    />,
  );

  return { closeOverlay, onRemoveCutover, onSetCutover };
};

export const selectMode = async (testId: string): Promise<void> => {
  await userEvent.setup().click(screen.getByTestId(testId));
};

export const queryRemoveButton = (): HTMLElement | null =>
  screen.queryByRole('button', { name: /remove cutover/iu });

export const getConfirmButton = (): HTMLElement => screen.getByTestId('modal-confirm-button');
