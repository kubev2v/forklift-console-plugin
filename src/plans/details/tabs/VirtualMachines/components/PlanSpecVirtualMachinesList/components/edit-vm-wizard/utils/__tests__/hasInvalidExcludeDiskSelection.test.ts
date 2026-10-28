import { hasInvalidExcludeDiskSelection } from '../hasInvalidExcludeDiskSelection';

const selection = {
  current: [] as string[],
  diskLoadError: null as Error | null,
  isInventoryLoading: false,
  selectableAddresses: ['disk-1', 'disk-2'],
  selected: ['disk-1'],
};

describe('hasInvalidExcludeDiskSelection', () => {
  it('allows a changed selection when inventory is available and a disk remains', () => {
    expect(hasInvalidExcludeDiskSelection(selection)).toBe(false);
  });

  it('blocks excluding every disk when inventory is available', () => {
    expect(hasInvalidExcludeDiskSelection({ ...selection, selected: ['disk-1', 'disk-2'] })).toBe(
      true,
    );
  });

  it('blocks a changed selection while inventory is loading', () => {
    expect(hasInvalidExcludeDiskSelection({ ...selection, isInventoryLoading: true })).toBe(true);
  });

  it('blocks a changed selection after an inventory error clears disk addresses', () => {
    expect(
      hasInvalidExcludeDiskSelection({
        ...selection,
        diskLoadError: new Error('inventory unavailable'),
        selectableAddresses: [],
      }),
    ).toBe(true);
  });

  it('blocks a changed selection when no selectable addresses are available', () => {
    expect(hasInvalidExcludeDiskSelection({ ...selection, selectableAddresses: [] })).toBe(true);
  });

  it('allows unrelated changes when disk selection is unchanged and inventory is unavailable', () => {
    expect(
      hasInvalidExcludeDiskSelection({
        ...selection,
        current: ['disk-1'],
        diskLoadError: new Error('inventory unavailable'),
        selectableAddresses: [],
      }),
    ).toBe(false);
  });
});
