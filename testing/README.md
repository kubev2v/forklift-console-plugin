# End-to-End Testing

## How to read this suite (architecture)

```
testing/playwright/
  e2e/
    upstream/       # Mocked APIs via intercepts — fast, no real providers
    downstream/     # Real cluster + .providers.json — full integration
  page-objects/     # POM: pages, wizard steps, modals, tables
  fixtures/         # Playwright fixtures that create/cleanup K8s resources
  intercepts/       # page.route mocks for upstream (K8s + Forklift inventory)
  utils/            # ResourceManager, timeouts, navigation, helpers
  types/            # Shared test-data types and enums
  global.setup.ts   # Login, auth storage, env relay
  global.teardown.ts
```

**Upstream vs downstream**

| | Upstream | Downstream |
|--|----------|------------|
| Tag | (default / `@upstream`) | `@downstream` |
| Data | Intercepts + static fixtures | Real providers from `.providers.json` |
| Run | `npm run test:upstream` | `npm run test:downstream` |

Upstream is the fast UI feedback loop. Downstream is the source of truth against a live MTV cluster.

**How a test is structured**

1. Spec under `e2e/` uses `test.step()` for narrative steps.
2. Interactions go through **page-objects** (not raw selectors scattered in specs).
3. Downstream specs pull resources from **fixtures** (`resourceFixtures.ts`).
4. Upstream specs call **`setupForkliftIntercepts(page)`** (and related setup helpers) so inventory/API calls return mock data.

**Fixture catalog** (`fixtures/resourceFixtures.ts`)

| Export | Creates |
|--------|---------|
| `sharedProviderFixtures` | Shared provider reused across tests |
| `sharedProviderCustomPlanFixtures` | Shared provider + customizable plan |
| `isolatedFixtures` | Isolated provider + plan per test |
| `isolatedCustomPlanFixtures` | Isolated provider + customizable plan |
| `providerOnlyFixtures` / `customProviderOnlyFixtures` | Provider only (no plan) |
| `sharedProviderNetworkMapFixtures` / `isolatedNetworkMapFixtures` | Provider + network map |
| `sharedProviderStorageMapFixtures` / `isolatedStorageMapFixtures` | Provider + storage map |

Factory: `createResourceFixtures(config)` — prefer an existing export before inventing a new fixture shape.

**Intercepts**

- Per-resource setup functions live under `intercepts/*.ts` (providers, VMs, plans, maps, …).
- `setupForkliftIntercepts(page)` wires the default upstream mock set (typically vSphere-oriented test UIDs).
- Prefer importing the specific `setupXIntercepts` you need when a test should not load the full default set.

**Conventions**

- Prefer `test.step('…', async () => { … })` so failures read as a story.
- Prefer `data-testid` locators via page-objects.
- Do not add new barrel `index.ts` files under `testing/playwright` (ESLint `barrel-files`).

**Root vs `testing/` dependencies (ESLint)**

Root `package.json` pins `@playwright/test` and `@kubernetes/client-node` as
devDependencies so type-aware ESLint can resolve Playwright/K8s types from a
root `npm ci` only (CI lint does not install `testing/`). Keep those versions
identical to `testing/package.json` whenever either side is bumped.

---

This document outlines the steps to run the Playwright end-to-end tests for the Forklift Console Plugin.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

1.  **Install Root Dependencies:**
    From the root directory of the project, install the necessary packages.
    ```bash
    npm install
    ```

2.  **Install Testing Dependencies:**
    Navigate to the `testing` directory and install the testing-specific packages.
    ```bash
    cd testing
    npm install
    ```

## Running Tests with a Local Console Server

This is the most common method for running the e2e tests during development.

1.  **Start the Local Console:**
    From the **root** of the project, run:
    ```bash
    npm start
    ```
    The local server will be available at `http://localhost:9000`.

2.  **Run the E2E Tests:**
    In a separate terminal, from the `testing` directory, run the full suite of tests:
    ```bash
    npm run test:e2e
    ```
    This command runs all tests in a headless browser. To run them in headed mode, use `npm run test:e2e -- --headed`.

### Running Specific Test Suites

If you want to run only a subset of the tests, you can use the following commands from the `testing` directory:

-   **Upstream Tests Only:**
    These will run with mock provider data.
    ```bash
    npm run test:upstream
    ```
    To run them in headed mode, use `npm run test:upstream -- --headed`.

-   **Downstream Tests Only:**
    Before running these, you'll need to create a `.providers.json` file in the `testing` directory to specify your provider's credentials.

    1.  **Create the Providers File:**
        Copy the template to create your providers file:
        ```bash
        cp .providers.json.template .providers.json
        ```

    2.  **Configure the Providers File:**
        Edit the `.providers.json` file and fill in the required credentials for your test providers.

    3.  **Run the Tests:**
        ```bash
        npm run test:downstream
        ```
    To run them in headed mode, use `npm run test:downstream -- --headed`.



## Running Against a Remote Console Server

Running tests against a remote cluster console requires additional configuration.

1.  **Create the Environment File:**
    In the `testing` directory, copy the template file:
    ```bash
    cp e2e.env.template e2e.env
    ```

2.  **Configure Environment Variables:**
    Edit the `e2e.env` file and provide the following details:
    -   `CLUSTER_USERNAME`: Your username for the cluster console.
    -   `CLUSTER_PASSWORD`: Your password for the cluster console.
    -   `BASE_ADDRESS`: The base URL for the cluster console.
    -   `VSPHERE_PROVIDER`: (Optional) The name of the vSphere provider for downstream tests. Defaults to `vsphere-8.0.1`.

3.  **Run the E2E Tests:**
    Once the `.env` file is configured, run the tests from the `testing` directory:
    ```bash
    npm run test:e2e
    ```

## Replicating the CI Environment

To closely replicate the downstream CI testing environment, you can run the tests inside a Docker container. This is useful for debugging CI-specific failures.

From the `testing` directory, run:
```bash
npm run test:downstream:remote:docker
```

## Updating the Container Image

To build and push the test container image manually:

```bash
# Copy locale files into the build context (they live at repo root)
cp -r locales/ testing/locales/
cd testing

podman build \
  --no-cache \
  --platform linux/amd64 \
  --build-arg VERSION=main \
  --build-arg GIT_COMMIT=$(git rev-parse HEAD) \
  --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  -f PlaywrightContainerFile \
  -t quay.io/kubev2v/forklift-ui-tests:latest \
  .

podman login quay.io
podman push quay.io/kubev2v/forklift-ui-tests:latest
```
