# End-to-End Testing

This document outlines the steps to run the Playwright end-to-end tests for the Forklift Console Plugin.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Yarn](https://yarnpkg.com/)

## Installation

1.  **Install Root Dependencies:**
    From the root directory of the project, install the necessary packages.
    ```bash
    yarn install
    ```

2.  **Install Testing Dependencies:**
    Navigate to the `testing` directory and install the testing-specific packages.
    ```bash
    cd testing
    yarn install
    ```

## Running Tests with a Local Console Server

This is the most common method for running the e2e tests during development.

1.  **Start the Local Console:**
    From the **root** of the project, run:
    ```bash
    yarn start
    ```
    The local server will be available at `http://localhost:9000`.

2.  **Run the E2E Tests:**
    In a separate terminal, from the `testing` directory, run the full suite of tests:
    ```bash
    yarn test:e2e
    ```
    This command runs all tests in a headless browser. To run them in headed mode, use `yarn test:e2e -- --headed`.

### Running Specific Test Suites

If you want to run only a subset of the tests, you can use the following commands from the `testing` directory:

-   **Upstream Tests Only:**
    These will run with mock provider data.
    ```bash
    yarn test:upstream
    ```
    To run them in headed mode, use `yarn test:upstream -- --headed`.

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
        yarn test:downstream
        ```
    To run them in headed mode, use `yarn test:downstream -- --headed`.



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
    yarn test:e2e
    ```

## Replicating the CI Environment

To closely replicate the downstream CI testing environment, you can run the tests inside a Docker container. This is useful for debugging CI-specific failures.

From the `testing` directory, run:
```bash
yarn test:downstream:remote:docker
```
