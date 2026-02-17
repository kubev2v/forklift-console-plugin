import { beforeEach, describe, expect, it } from '@jest/globals';
import { useResolvedExtensions } from '@openshift-console/dynamic-plugin-sdk';
import { act, renderHook } from '@testing-library/react-hooks';

import { useLightspeed } from '../useLightspeed';
import { clickOLSSubmitButton } from '../utils';

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  useResolvedExtensions: jest.fn(),
}));

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  clickOLSSubmitButton: jest.fn(),
}));

const mockUseResolvedExtensions = useResolvedExtensions as jest.MockedFunction<
  typeof useResolvedExtensions
>;

const OLS_EXTENSION = {
  properties: { scope: 'ols' },
  type: 'console.redux-reducer',
};

describe('useLightspeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('availability detection', () => {
    it('returns loading state when extensions not yet resolved', () => {
      (mockUseResolvedExtensions as jest.Mock).mockReturnValue([[], false]);

      const { result } = renderHook(() => useLightspeed());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAvailable).toBe(false);
    });

    it('returns unavailable when no OLS extension is found', () => {
      (mockUseResolvedExtensions as jest.Mock).mockReturnValue([[], true]);

      const { result } = renderHook(() => useLightspeed());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAvailable).toBe(false);
    });

    it('returns available when OLS extension is found', () => {
      (mockUseResolvedExtensions as jest.Mock).mockReturnValue([[OLS_EXTENSION], true]);

      const { result } = renderHook(() => useLightspeed());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAvailable).toBe(true);
    });
  });

  describe('openLightspeed', () => {
    it('does not dispatch when unavailable', () => {
      (mockUseResolvedExtensions as jest.Mock).mockReturnValue([[], true]);

      const { result } = renderHook(() => useLightspeed());

      act(() => {
        result.current.openLightspeed('test prompt');
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('dispatches openOLS action when called without arguments', () => {
      (mockUseResolvedExtensions as jest.Mock).mockReturnValue([[OLS_EXTENSION], true]);

      const { result } = renderHook(() => useLightspeed());

      act(() => {
        result.current.openLightspeed();
      });

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'openOLS' }));
    });

    it('dispatches setQuery and openOLS when called with a prompt', () => {
      (mockUseResolvedExtensions as jest.Mock).mockReturnValue([[OLS_EXTENSION], true]);

      const { result } = renderHook(() => useLightspeed());

      act(() => {
        result.current.openLightspeed('Why is my migration stuck?');
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: { query: 'Why is my migration stuck?' },
          type: 'setQuery',
        }),
      );
      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'openOLS' }));
    });

    it('dispatches attachment actions when called with attachments', () => {
      (mockUseResolvedExtensions as jest.Mock).mockReturnValue([[OLS_EXTENSION], true]);

      const { result } = renderHook(() => useLightspeed());
      const attachment = {
        attachmentType: 'YAML' as const,
        kind: 'Plan',
        name: 'test-plan',
        namespace: 'openshift-mtv',
        value: 'apiVersion: forklift.konveyor.io/v1beta1',
      };

      act(() => {
        result.current.openLightspeed('Check this plan', [attachment]);
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: attachment,
          type: 'attachmentSet',
        }),
      );
    });

    it('calls clickOLSSubmitButton when autoSubmit option is set', () => {
      (mockUseResolvedExtensions as jest.Mock).mockReturnValue([[OLS_EXTENSION], true]);

      const { result } = renderHook(() => useLightspeed());

      act(() => {
        result.current.openLightspeed('test prompt', undefined, { autoSubmit: true });
      });

      expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'openOLS' }));
      expect(clickOLSSubmitButton).toHaveBeenCalledTimes(1);
    });

    it('does not call clickOLSSubmitButton when autoSubmit is not set', () => {
      (mockUseResolvedExtensions as jest.Mock).mockReturnValue([[OLS_EXTENSION], true]);

      const { result } = renderHook(() => useLightspeed());

      act(() => {
        result.current.openLightspeed('test prompt');
      });

      expect(clickOLSSubmitButton).not.toHaveBeenCalled();
    });
  });
});
