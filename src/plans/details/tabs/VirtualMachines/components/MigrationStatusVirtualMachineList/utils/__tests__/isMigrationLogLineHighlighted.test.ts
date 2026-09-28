import { isMigrationLogLineHighlighted } from '../isMigrationLogLineHighlighted';

describe('isMigrationLogLineHighlighted', () => {
  it('highlights virt-v2v error lines', () => {
    expect(
      isMigrationLogLineHighlighted(
        'virt-v2v: error: libguestfs error: could not create appliance',
      ),
    ).toBe(true);
  });

  it('does not highlight info lines', () => {
    expect(isMigrationLogLineHighlighted('level=info msg="Beginning guest conversion"')).toBe(
      false,
    );
  });
});
