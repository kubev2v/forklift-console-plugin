// Fallback if PatternFly's lazily mounted popover misbehaves under jsdom: drop the last test
// and cover that path in Playwright/manual QA. The alert assertions stay, since the alert
// renders eagerly and is the primary place the drivers link must appear.
import type { V1beta1Plan } from '@forklift-ui/types';
import { describe, expect, it, jest } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { VIRTIO_WIN_DRIVERS_DOWNLOAD_URL } from '@utils/links';

import GuestConversionEditModal from '../GuestConversionEditModal';

mockI18n();

const DOWNLOAD_LABEL = 'Download VirtIO drivers';
const ALERT_TITLE =
  "If you don't use compatibility mode, you must have VirtIO drivers already installed in the source VM.";

const closeOverlay = jest.fn();

const makePlan = (useCompatibilityMode: boolean, skipGuestConversion = true): V1beta1Plan =>
  ({
    metadata: { name: 'test-plan', namespace: 'test-ns' },
    spec: { skipGuestConversion, useCompatibilityMode },
  }) as unknown as V1beta1Plan;

const renderModal = (useCompatibilityMode: boolean, skipGuestConversion = true): void => {
  render(
    <GuestConversionEditModal
      closeOverlay={closeOverlay}
      resource={makePlan(useCompatibilityMode, skipGuestConversion)}
    />,
  );
};

// PatternFly's Alert renders no landmark role, so the modal supplies a stable test id.
const getWarningAlert = (): HTMLElement =>
  screen.getByTestId('use-compatibility-mode-warning-alert');

// The help trigger is PatternFly's icon-only button: no label text and no aria-label.
const getHelpTrigger = (): HTMLElement => {
  const trigger = screen
    .getAllByRole('button')
    .find((button) => button.textContent === '' && !button.hasAttribute('aria-label'));
  if (!trigger) {
    throw new Error('compatibility mode help trigger not found');
  }
  return trigger;
};

describe('GuestConversionEditModal VirtIO drivers links', () => {
  it('links to the drivers download from the compatibility mode warning alert', () => {
    renderModal(false);

    const alert = getWarningAlert();
    expect(within(alert).getByText(ALERT_TITLE)).toBeInTheDocument();

    const link = within(alert).getByRole('link', { name: DOWNLOAD_LABEL });
    expect(link).toHaveAttribute('href', VIRTIO_WIN_DRIVERS_DOWNLOAD_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('hides the warning alert and its link when compatibility mode is on', () => {
    renderModal(true);

    expect(screen.queryByTestId('use-compatibility-mode-warning-alert')).not.toBeInTheDocument();
    expect(screen.queryByText(ALERT_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: DOWNLOAD_LABEL })).not.toBeInTheDocument();
  });

  it('keeps the compatibility block and its link out when guest conversion is enabled', () => {
    renderModal(false, false);

    expect(screen.queryByTestId('use-compatibility-mode-checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: DOWNLOAD_LABEL })).not.toBeInTheDocument();
  });

  it('offers the same link inside the compatibility mode help popover', async () => {
    const user = userEvent.setup();
    renderModal(true);

    expect(screen.queryByRole('link', { name: DOWNLOAD_LABEL })).not.toBeInTheDocument();

    await user.click(getHelpTrigger());

    const link = await screen.findByRole('link', { name: DOWNLOAD_LABEL });
    expect(link).toHaveAttribute('href', VIRTIO_WIN_DRIVERS_DOWNLOAD_URL);
    expect(link).toHaveAttribute('target', '_blank');
  });
});
