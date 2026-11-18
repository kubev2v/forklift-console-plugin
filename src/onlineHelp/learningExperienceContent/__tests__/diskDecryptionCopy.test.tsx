import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { keyTerminologyItems } from '../quickReferencesSection/keyTerminologyItems';
import { additionalSettingsSubTopic } from '../topics/migratingVMsTopic/subTopics/additionalSettingsSubTopic';

describe('disk decryption online help copy', () => {
  it('mentions BitLocker in the additional settings topic', () => {
    const subTopic = additionalSettingsSubTopic().subTopics?.()[0];

    render(<>{subTopic?.title}</>);

    expect(screen.getByText(/LUKS- or BitLocker-encrypted disks/)).toBeInTheDocument();
  });

  it('mentions BitLocker in the disk decryption glossary entry', () => {
    const entry = keyTerminologyItems.find((item) => item.title === 'Disk decryption passphrases');

    expect(entry?.description).toContain('LUKS- or BitLocker-encrypted devices');
  });
});
