import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import EditLUKSModalBody from '../components/EditLUKSModalBody';

describe('EditLUKSModalBody', () => {
  it('mentions BitLocker and keeps the NBDE unlocking claim LUKS-only', () => {
    render(<EditLUKSModalBody />);

    expect(screen.getByText(/LUKS- or BitLocker-encrypted devices/)).toBeInTheDocument();
    expect(screen.getByText(/automatically unlock LUKS-encrypted devices/)).toBeInTheDocument();
  });
});
