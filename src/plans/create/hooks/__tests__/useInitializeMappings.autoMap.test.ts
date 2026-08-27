import { useFormContext } from 'react-hook-form';

import { act, renderHook } from '@testing-library/react-hooks';
import { NetworkMapFieldId } from '@utils/mappings/networkMap';

import { useInitializeMappings } from '../useInitializeMappings';

jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(),
}));

const mockSetValue = jest.fn();
const mockTrigger = jest.fn().mockResolvedValue(true);
const mockClearErrors = jest.fn();
const mockUseFormContext = useFormContext as jest.MockedFunction<typeof useFormContext>;

const fieldIds = {
  mapField: NetworkMapFieldId.NetworkMap,
  sourceField: NetworkMapFieldId.SourceNetwork,
  targetField: NetworkMapFieldId.TargetNetwork,
};

const defaultTarget = { name: 'Default network' };

describe('useInitializeMappings - autoMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseFormContext.mockReturnValue({
      clearErrors: mockClearErrors,
      setValue: mockSetValue,
      trigger: mockTrigger,
    } as never);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does nothing while loading', () => {
    renderHook(() => {
      useInitializeMappings({
        currentMap: undefined,
        defaultTarget,
        fieldIds,
        isLoading: true,
        usedSources: [{ name: 'src-a' }],
      });
    });

    expect(mockSetValue).not.toHaveBeenCalled();
  });

  it('seeds an empty mapping row when map and sources are empty', () => {
    renderHook(() => {
      useInitializeMappings({
        currentMap: [],
        defaultTarget,
        defaultTargetName: 'pod',
        fieldIds,
        isLoading: false,
        usedSources: [],
      });
    });

    expect(mockSetValue).toHaveBeenCalledWith(
      NetworkMapFieldId.NetworkMap,
      [
        {
          [NetworkMapFieldId.SourceNetwork]: { name: '' },
          [NetworkMapFieldId.TargetNetwork]: { name: 'pod' },
        },
      ],
      { shouldDirty: true, shouldValidate: true },
    );
  });

  it('auto-maps unmapped sources and triggers validation', () => {
    renderHook(() => {
      useInitializeMappings({
        currentMap: [
          {
            [NetworkMapFieldId.SourceNetwork]: { name: '' },
            [NetworkMapFieldId.TargetNetwork]: defaultTarget,
          },
        ],
        defaultTarget,
        fieldIds,
        isLoading: false,
        usedSources: [
          { id: '1', name: 'src-a' },
          { id: '2', name: 'src-b' },
        ],
      });
    });

    expect(mockClearErrors).toHaveBeenCalledWith(NetworkMapFieldId.NetworkMap);
    expect(mockSetValue).toHaveBeenCalledWith(
      NetworkMapFieldId.NetworkMap,
      [
        {
          [NetworkMapFieldId.SourceNetwork]: { id: '1', name: 'src-a' },
          [NetworkMapFieldId.TargetNetwork]: defaultTarget,
        },
        {
          [NetworkMapFieldId.SourceNetwork]: { id: '2', name: 'src-b' },
          [NetworkMapFieldId.TargetNetwork]: defaultTarget,
        },
      ],
      { shouldDirty: true, shouldValidate: true },
    );

    act(() => {
      jest.runAllTimers();
    });
    expect(mockTrigger).toHaveBeenCalled();
  });

  it('skips sources already present in the current map', () => {
    renderHook(() => {
      useInitializeMappings({
        currentMap: [
          {
            [NetworkMapFieldId.SourceNetwork]: { name: 'src-a' },
            [NetworkMapFieldId.TargetNetwork]: defaultTarget,
          },
        ],
        defaultTarget,
        fieldIds,
        isLoading: false,
        usedSources: [{ name: 'src-a' }, { name: 'src-b' }],
      });
    });

    const updated = mockSetValue.mock.calls[0][1] as { sourceNetwork: { name: string } }[];
    expect(updated.map((row) => row.sourceNetwork.name)).toEqual(['src-a', 'src-b']);
  });
});
