import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { useLightspeed } from '@utils/hooks/useLightspeed/useLightspeed';

import AskAISection from '../AskAISection';

const mockOpenLightspeed = jest.fn();

jest.mock('@utils/hooks/useLightspeed/useLightspeed', () => ({
  useLightspeed: jest.fn(),
}));

const mockUseLightspeed = useLightspeed as jest.MockedFunction<typeof useLightspeed>;

describe('AskAISection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when loading', () => {
    mockUseLightspeed.mockReturnValue({
      isAvailable: false,
      isLoading: true,
      openLightspeed: mockOpenLightspeed,
    });

    const { container } = render(<AskAISection />);

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when unavailable', () => {
    mockUseLightspeed.mockReturnValue({
      isAvailable: false,
      isLoading: false,
      openLightspeed: mockOpenLightspeed,
    });

    const { container } = render(<AskAISection />);

    expect(container.firstChild).toBeNull();
  });

  it('renders the card with title when available', () => {
    mockUseLightspeed.mockReturnValue({
      isAvailable: true,
      isLoading: false,
      openLightspeed: mockOpenLightspeed,
    });

    render(<AskAISection />);

    expect(screen.getByText('Ask AI assistant')).toBeInTheDocument();
    expect(screen.getByText('Common troubleshooting questions')).toBeInTheDocument();
  });

  it('calls openLightspeed with the question when a pre-canned question is clicked', async () => {
    const user = userEvent.setup();
    mockUseLightspeed.mockReturnValue({
      isAvailable: true,
      isLoading: false,
      openLightspeed: mockOpenLightspeed,
    });

    render(<AskAISection />);

    await user.click(screen.getByText('Common troubleshooting questions'));

    const questionButton = screen.getByRole('button', {
      name: 'How do I check network mapping for a failed migration?',
    });
    await user.click(questionButton);

    expect(mockOpenLightspeed).toHaveBeenCalledWith(
      'How do I check network mapping for a failed migration?',
    );
  });

  it('renders all three pre-canned questions', () => {
    mockUseLightspeed.mockReturnValue({
      isAvailable: true,
      isLoading: false,
      openLightspeed: mockOpenLightspeed,
    });

    render(<AskAISection />);

    expect(
      screen.getByText('How do I check network mapping for a failed migration?'),
    ).toBeInTheDocument();
    expect(screen.getByText('Why is my warm migration stuck?')).toBeInTheDocument();
    expect(screen.getByText("Why aren't my VMs working after migration?")).toBeInTheDocument();
  });
});
