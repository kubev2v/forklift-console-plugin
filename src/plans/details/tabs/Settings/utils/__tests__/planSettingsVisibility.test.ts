import { PLAN_SETTINGS_SECTION_ID } from '../planSettingsSectionIds';
import {
  getVisiblePlanSettingsSections,
  resolvePlanSettingsSection,
} from '../planSettingsVisibility';

describe('getVisiblePlanSettingsSections', () => {
  it('returns all sections for vSphere', () => {
    expect(
      getVisiblePlanSettingsSections({
        isOvirt: false,
        isTransferNetworkVisible: true,
        isVsphere: true,
      }),
    ).toEqual([
      PLAN_SETTINGS_SECTION_ID.Guest,
      PLAN_SETTINGS_SECTION_ID.Transfer,
      PLAN_SETTINGS_SECTION_ID.Naming,
      PLAN_SETTINGS_SECTION_ID.Target,
      PLAN_SETTINGS_SECTION_ID.Convertor,
    ]);
  });

  it('returns guest, transfer, and target for oVirt', () => {
    expect(
      getVisiblePlanSettingsSections({
        isOvirt: true,
        isTransferNetworkVisible: true,
        isVsphere: false,
      }),
    ).toEqual([
      PLAN_SETTINGS_SECTION_ID.Guest,
      PLAN_SETTINGS_SECTION_ID.Transfer,
      PLAN_SETTINGS_SECTION_ID.Target,
    ]);
  });

  it('returns target only when transfer network is hidden and not vSphere', () => {
    expect(
      getVisiblePlanSettingsSections({
        isOvirt: false,
        isTransferNetworkVisible: false,
        isVsphere: false,
      }),
    ).toEqual([PLAN_SETTINGS_SECTION_ID.Target]);
  });

  it('returns transfer and target for generic non-vSphere with transfer visible', () => {
    expect(
      getVisiblePlanSettingsSections({
        isOvirt: false,
        isTransferNetworkVisible: true,
        isVsphere: false,
      }),
    ).toEqual([PLAN_SETTINGS_SECTION_ID.Transfer, PLAN_SETTINGS_SECTION_ID.Target]);
  });
});

describe('resolvePlanSettingsSection', () => {
  const visible = [PLAN_SETTINGS_SECTION_ID.Transfer, PLAN_SETTINGS_SECTION_ID.Target];

  it('falls back to first visible section when requested section is hidden', () => {
    expect(resolvePlanSettingsSection(PLAN_SETTINGS_SECTION_ID.Convertor, visible)).toBe(
      PLAN_SETTINGS_SECTION_ID.Transfer,
    );
  });

  it('keeps requested section when visible', () => {
    expect(resolvePlanSettingsSection(PLAN_SETTINGS_SECTION_ID.Target, visible)).toBe(
      PLAN_SETTINGS_SECTION_ID.Target,
    );
  });
});
