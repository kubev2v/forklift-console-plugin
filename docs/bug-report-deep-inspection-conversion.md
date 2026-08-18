# Bug report — DeepInspection Conversion hang / Failed after successful inspect

**Status:** Draft (local only — not filed in Jira yet)  
**Date:** 2026-08-18  
**Reporter:** Pedro Abreu / AI-assisted triage  
**Related CI:** Jenkins UI Playwright on qemtv-09, MTV 2.12.6 — `plan-deep-inspection.spec.ts` → `should allow re-inspection after completion`  
**Triage (Playwright fail):** **Environment** (primary) + **Test issue** (fixture teardown). Product findings below are separate follow-ons.

---

## Description of problem:

```
DeepInspection Conversions can remain in Running/PodRunning for 15–30+ minutes
while virt-inspector reads multi-disk Windows VMs over VDDK/NBD, then fail with
"conversion pod failed". Separately, a Conversion that already completed
inspection successfully can still end Failed at RemovingSnapshot when the
provider connection Secret is deleted during teardown (e.g. test fixture cleanup).
```

## Version-Release number of selected component (if applicable):

```
MTV / Forklift 2.12.6 (CSV mtv-operator.v2.12.6)
Cluster: qemtv-09 (https://api.qemtv-09.rhos-psi.cnv-qe.rhood.us:6443)
Console plugin under test: quay.io/pabreu/forklift-ui:latest (Jenkins UI job)
```

## How reproducible:

```
Often on multi-disk Windows VMs in this lab (reproduced via API on qemtv-09).
RemovingSnapshot/secret failure: Always when the provider Secret is deleted
while Conversion is still cleaning up after a successful inspect.
```

## Steps to Reproduce:

### A — Slow / failed DeepInspection (API repro)

1) On qemtv-09, create a Ready vSphere provider with a valid connection Secret that includes `url`, `user`, `password`, `insecureSkipVerify`.
2) Pick a multi-disk Windows VM from inventory (repro used `mtv-win2022-ip-3disks` / `vm-1012` on vsphere 8.0.3).
3) Create a `Conversion` with `spec.type: DeepInspection` referencing that VM and Secret.
4) Watch `status.phase` / `status.stage` and the deep-inspection pod logs.

### B — Failed RemovingSnapshot after successful inspect (Jenkins leftover)

1) Run deep inspection until the pod completes and inspection results are present (`allChecksPassed` / similar).
2) Delete the provider connection Secret (or the whole provider) while the Conversion is still in `RemovingSnapshot`.
3) Observe Conversion final phase/message.

## Actual results:

```
A) Conversion stays Running / PodRunning while virt-inspector + qemu-kvm run
   with no further log progress for 25–30+ minutes. Pod eventually exits Error
   (exit 1). Conversion → Failed / Finished: "The conversion has failed:
   conversion pod failed".

   Concurrent re-inspect (second Conversion on the same VM) also sits in
   PodRunning for 10–15+ minutes and can fail the same way.

B) Conversion ends Failed / RemovingSnapshot with:
   Secret "<provider-secret>" not found
   even though inspection itself had already succeeded.

UI / Playwright: plan VM row stays on "Running" past the 600s expect, so
"should allow re-inspection after completion" fails.
```

## Expected results:

```
A) DeepInspection completes (Succeeds or fails with a clear, actionable
   message) within a bounded time; long virt-inspector work should not look
   like an indefinite hang with a generic "conversion pod failed".

B) After a successful inspection, snapshot/secret teardown failures should not
   overwrite a successful outcome (or cleanup should tolerate a missing
   connection Secret and still leave Conversion Succeeded with results).
```

## Additional info:

```
### Triage classification (CI failure)
- Primary: Environment — lab/vSphere + multi-disk Windows inspection latency/stall.
- Secondary: Test issue — Playwright fixture deletes provider/secret while
  Conversion cleanup still running; 600s timeout may be tight for this VM class.
- Not a version-gate / console-plugin locator bug.
- Suggested product tickets (if filing): Conversion controller cleanup
  robustness; deep-inspection hang/timeout/diagnostics on multi-disk Windows.

### Jenkins leftover (still on qemtv-09 at report time)
NAME: deep-inspection-mtv-func-win2022-dzgds
PHASE/STAGE: Failed / RemovingSnapshot
MSG: Secret "test-shared-provider-79d47db5-a863-4b01-a854-b37135fbdc24-rg6zv" not found
SNAPSHOT: snapshot-2403 (owned)

### API repro Conversions (qemtv-09, provider repro-vs803)
- repro-di-first-wng22  → Failed / Finished — conversion pod failed
  (~31m; virt-inspector running ~26m on 3 disks, snapshot-2055)
- repro-di-second-9hm6t → Failed / Finished — conversion pod failed
  (started while first still Running; snapshot-2056)

Pod evidence (first Conversion): deep-inspection container last logs show
"Running virt-inspector on NBD" / disk_count=3, then no further progress until
pod Error exitCode=1.

### Playwright
- Spec: testing/playwright/e2e/downstream/plans/plan-deep-inspection.spec.ts
- Fail: "should allow re-inspection after completion" (expect completed within 600s)
- Prior serial test "transition Running → completed" passed (~8.6m) on mtv-func-win2022

### Suggested test hardening (not product fixes)
- Do not delete provider Secret until Conversion reaches a terminal phase
  (or only after RemovingSnapshot completes).
- Prefer a smaller/faster VM for deep-inspect E2E, or raise timeout / poll
  Conversion CR instead of UI-only status for long inspections.
- Avoid starting re-inspect while a prior Conversion for the same VM is still Running.

### Regression
Unclear — needs backend blame on Conversion RemovingSnapshot error handling
and deep-inspection timeout behavior. Treat as possible original gap until proven.
```

---

## Suggested Jira fields (when filing)

| Field | Suggested value |
|-------|-----------------|
| Project | MTV |
| Type | Bug |
| Component | Controller (or Conversion / deep-inspection — not primarily UI) |
| Severity | Moderate (Important if cleanup-after-success is common in production) |
| Labels | `ai-discovered`, consider `deep-inspection` |
| Story points | 3–5 |
| Regression | Unclear (comment when filing) |
