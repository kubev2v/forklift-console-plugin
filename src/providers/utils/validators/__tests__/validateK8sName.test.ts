import { validateK8sName } from 'src/utils/validation/common';

describe('validateK8sName', () => {
  it('validates correct k8s names', () => {
    expect(validateK8sName('k8s-name')).toBe(true);
    expect(validateK8sName('k8s.name')).toBe(true);
    expect(validateK8sName('k8sname')).toBe(true);
    expect(validateK8sName('k8')).toBe(true);
    expect(validateK8sName('1a-k8')).toBe(true);
  });

  it('invalidates k8s names with invalid characters', () => {
    expect(validateK8sName('k8s_name')).toBe(false);
    expect(validateK8sName('k8s%name')).toBe(false);
    expect(validateK8sName('k8sname.')).toBe(false);
    expect(validateK8sName('.k8sname')).toBe(false);
    expect(validateK8sName('k8..sname')).toBe(false);
    expect(validateK8sName('k8.-sname')).toBe(false);
  });

  it('invalidates k8s names that are too long', () => {
    const longName = 'k'.repeat(254);
    expect(validateK8sName(longName)).toBe(false);
  });

  it('invalidates k8s names that start with a hyphen', () => {
    expect(validateK8sName('-k8sname')).toBe(false);
  });

  it('invalidates k8s names that end with a hyphen', () => {
    expect(validateK8sName('k8sname-')).toBe(false);
  });
});
