/** Short wait: guided tour either shows immediately or not at all. */
export const GUIDED_TOUR_VISIBLE_TIMEOUT_MS = 2_000;
/** force:true bypasses animation-stability checks; keep timeout short. */
export const GUIDED_TOUR_CLICK_TIMEOUT_MS = 3_000;
export const GUIDED_TOUR_HIDDEN_TIMEOUT_MS = 3_000;
/** Total attempts before giving up on dismissing the guided tour. */
export const GUIDED_TOUR_MAX_ATTEMPTS = 3;
/** Backoff between attempts, letting an in-flight tour re-render settle. */
export const GUIDED_TOUR_RETRY_BACKOFF_MS = 500;

/** Initial check before reloading when the dynamic plugin may not have registered its routes yet. */
export const PAGE_LOAD_INITIAL_TIMEOUT_MS = 10_000;
/** Extended wait after a reload to give the plugin time to initialize. */
export const PAGE_LOAD_RETRY_TIMEOUT_MS = 20_000;

/** Navigation / page shell load (H1 appears). */
export const PAGE_LOAD_TIMEOUT_MS = 15_000;

/** Generic element visibility check. */
export const ELEMENT_VISIBLE_TIMEOUT_MS = 10_000;

/** Locale JSON is fetched after load; slow clusters need extra time for useTranslation to receive it. */
export const LOCALE_LOAD_TIMEOUT_MS = 30_000;

/** Pod watch data arrives asynchronously; give it time to settle before asserting. */
export const POD_WATCH_TIMEOUT_MS = 30_000;

/** The provider watch + inventory REST call are sequential; on slow clusters the full chain can exceed 15 s. */
export const RESOURCES_HEADING_TIMEOUT_MS = 30_000;
