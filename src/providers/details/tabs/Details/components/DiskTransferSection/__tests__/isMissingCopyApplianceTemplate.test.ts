import { isMissingCopyApplianceTemplate } from '../isMissingCopyApplianceTemplate';

const templateName = 'source-copy-appliance-template';
const missingInstance = {
  code: 404,
  json: {
    details: {
      group: 'forklift.konveyor.io',
      kind: 'copyappliancetemplates',
      name: templateName,
    },
    reason: 'NotFound',
  },
};

describe('isMissingCopyApplianceTemplate', () => {
  it('recognizes only a named CopyApplianceTemplate instance absence', () => {
    expect(isMissingCopyApplianceTemplate(missingInstance, templateName)).toBe(true);
    expect(isMissingCopyApplianceTemplate(missingInstance, 'other-template')).toBe(false);
  });

  it('does not mistake a missing CRD route for a missing template instance', () => {
    expect(
      isMissingCopyApplianceTemplate({ code: 404, json: { reason: 'NotFound' } }, templateName),
    ).toBe(false);
    expect(
      isMissingCopyApplianceTemplate(
        { code: 404, json: { details: {}, reason: 'NotFound' } },
        templateName,
      ),
    ).toBe(false);
  });

  it('keeps permissions and other resources unresolved', () => {
    expect(isMissingCopyApplianceTemplate({ code: 403 }, templateName)).toBe(false);
    expect(
      isMissingCopyApplianceTemplate(
        {
          ...missingInstance,
          json: {
            ...missingInstance.json,
            details: { ...missingInstance.json.details, kind: 'providers' },
          },
        },
        templateName,
      ),
    ).toBe(false);
  });
});
