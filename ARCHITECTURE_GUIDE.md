# Forklift Console Plugin Architecture Guide

## Table of Contents
1. [Package Management: npm and yarn](#package-management-npm-and-yarn)
2. [Project Structure and Build System](#project-structure-and-build-system)
3. [OpenShift Console Dynamic Plugin Architecture](#openshift-console-dynamic-plugin-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Integration: Connecting to MTV](#backend-integration-connecting-to-mtv)
6. [Data Flow and API Communication](#data-flow-and-api-communication)
7. [Development Workflow](#development-workflow)

---

## Package Management: npm and yarn

### Understanding npm

**npm** (Node Package Manager) is the default package manager for Node.js and JavaScript. It comes bundled with Node.js and serves multiple purposes:

1. **Package Registry**: npm hosts the world's largest collection of JavaScript packages (over 2 million packages)
2. **Command-Line Tool**: Provides commands like `npm install`, `npm run`, `npm publish`
3. **Package Format**: Defines the structure of `package.json` files and how dependencies are resolved

**Key npm Concepts:**
- **package.json**: Manifest file that defines project metadata, dependencies, and scripts
- **node_modules/**: Directory where installed packages are stored
- **package-lock.json**: Locks exact versions of dependencies for reproducible installs
- **npm registry**: Central repository at registry.npmjs.org

### Understanding yarn

**Yarn** (Yet Another Resource Negotiator) is an alternative package manager created by Facebook (now Meta) to address some limitations of npm:

1. **Faster Installation**: Uses parallel downloads and better caching
2. **Deterministic Installs**: Creates `yarn.lock` file for consistent dependency resolution
3. **Better Security**: Checks package integrity using checksums
4. **Workspace Support**: Better monorepo support out of the box
5. **Offline Mode**: Can work with cached packages offline

**Key Yarn Concepts:**
- **yarn.lock**: Similar to package-lock.json but with different format
- **Workspaces**: Native support for managing multiple packages in one repository
- **Plug'n'Play (PnP)**: Alternative to node_modules (not used in this project)

### npm vs yarn: The Relationship

**Similarities:**
- Both read from `package.json` for dependency definitions
- Both resolve dependencies from npm registry (or other registries)
- Both support semantic versioning (semver)
- Both create lock files for reproducible builds

**Differences:**

| Feature | npm | yarn |
|---------|-----|------|
| Lock file | `package-lock.json` | `yarn.lock` |
| Install speed | Slower (sequential) | Faster (parallel) |
| CLI commands | `npm install` | `yarn install` or `yarn` |
| Scripts | `npm run <script>` | `yarn <script>` |
| Workspaces | Added later | Native support |
| Security | Good | Enhanced checksums |

**Why This Project Uses Yarn:**

The Forklift Console Plugin uses Yarn because:
1. **Faster Development**: Quicker installs mean faster iteration cycles
2. **Better Lock File**: `yarn.lock` provides more deterministic builds
3. **Workspace Support**: The project structure benefits from Yarn's workspace features
4. **Community Standard**: Many OpenShift/Kubernetes projects use Yarn

**Interoperability:**
- Both can read the same `package.json`
- Lock files are NOT interchangeable (use one or the other)
- You can migrate between them, but it's recommended to stick with one
- This project uses Yarn exclusively (note: `yarn.lock` is present, not `package-lock.json`)

---

## Project Structure and Build System

### Project Overview

The Forklift Console Plugin is a **TypeScript React application** that extends the OpenShift Web Console. It's built using:

- **Language**: TypeScript (type-safe JavaScript)
- **UI Framework**: React 17.0.2
- **Build Tool**: Webpack 5.98.0
- **Package Manager**: Yarn
- **UI Components**: PatternFly 6.4.0 (Red Hat's design system)

### Directory Structure

```
forklift-console-plugin/
├── src/                          # Source code
│   ├── components/              # Reusable UI components
│   ├── modules/                  # Feature modules (Providers, etc.)
│   ├── plans/                   # Migration plans feature
│   ├── providers/               # Provider management feature
│   ├── networkMaps/             # Network mapping feature
│   ├── storageMaps/             # Storage mapping feature
│   ├── overview/                # Overview/dashboard feature
│   └── utils/                   # Utility functions
├── dist/                        # Build output (generated)
├── node_modules/                # Dependencies (installed by yarn)
├── package.json                 # Project manifest
├── yarn.lock                    # Dependency lock file
├── webpack.config.ts            # Webpack build configuration
├── plugin-metadata.ts           # Plugin metadata for OpenShift
├── plugin-extensions.ts         # Plugin extension definitions
└── tsconfig.json                # TypeScript configuration
```

### Build System: Webpack

**Webpack** is a module bundler that:
1. **Bundles Code**: Combines multiple JavaScript/TypeScript files into optimized bundles
2. **Transpiles**: Converts TypeScript to JavaScript using `ts-loader`
3. **Processes Assets**: Handles CSS, images, fonts, etc.
4. **Code Splitting**: Creates separate chunks for better loading performance
5. **Hot Module Replacement**: Enables live reloading during development

**Key Webpack Configuration Points:**

```typescript
// webpack.config.ts highlights:

// Entry point: Empty object - ConsoleRemotePlugin generates entries
entry: {},

// Output: Bundles go to dist/ directory
output: {
  chunkFilename: '[name]-chunk.js',
  filename: '[name]-bundle.js',
  path: path.resolve(__dirname, 'dist'),
},

// Loaders: Transform different file types
module: {
  rules: [
    { test: /\.tsx?$/, use: 'ts-loader' },      // TypeScript
    { test: /\.s?css$/, use: ['style-loader', 'css-loader', 'sass-loader'] }, // Styles
    { test: /\.svg$/, type: 'asset/inline' },   // SVGs as data URIs
  ],
},

// Plugins: Extend functionality
plugins: [
  new ConsoleRemotePlugin({ ... }),  // OpenShift plugin SDK
  new ForkTsCheckerWebpackPlugin(),  // Type checking in parallel
  new CopyPlugin(),                  // Copy locale files
],
```

**Development vs Production Builds:**

- **Development** (`yarn start`):
  - Source maps enabled
  - Hot module replacement
  - Unminified code
  - Runs on `localhost:9001`

- **Production** (`yarn build`):
  - Minified code
  - Optimized chunks with hashes
  - No source maps (or separate files)
  - Deterministic chunk IDs

### Package.json Scripts

The `package.json` defines scripts that abstract complex commands:

```json
{
  "scripts": {
    "start": "NODE_ENV=development webpack serve --progress",
    "build": "NODE_ENV=production webpack",
    "lint": "eslint 'src/**/*.{ts,tsx}' ...",
    "test": "TZ=UTC jest",
    "console": "bash ./ci/start-console.sh"
  }
}
```

**Common Workflow:**
1. `yarn install` - Install dependencies
2. `yarn start` - Start development server
3. `yarn build` - Create production bundle
4. `yarn lint` - Check code quality
5. `yarn test` - Run tests

---

## OpenShift Console Dynamic Plugin Architecture

### What is a Dynamic Plugin?

The OpenShift Console Dynamic Plugin SDK allows developers to extend the OpenShift Web Console **without modifying the core console code**. This is a plugin architecture where:

1. **Core Console**: The main OpenShift console application
2. **Plugin**: Separate application that extends the console
3. **Runtime Integration**: Plugins are loaded dynamically at runtime

### Plugin Architecture Components

#### 1. Plugin Metadata (`plugin-metadata.ts`)

Defines what the plugin exposes to the console:

```typescript
const pluginMetadata: ConsolePluginBuildMetadata = {
  name: 'forklift-console-plugin',
  version: '2.8.0',
  description: 'Forklift migration tools UI',
  dependencies: {
    '@console/pluginAPI': '*',  // Console SDK version
  },
  exposedModules: {
    // Components the console can import
    ProviderDetailsPage: './providers/details/ProviderDetailsPage',
    ProvidersListPage: './providers/list/ProvidersListPage',
    // ... more modules
  },
};
```

**Key Points:**
- **Name**: Unique identifier for the plugin
- **Version**: Plugin version (used for updates)
- **Dependencies**: What console APIs the plugin needs
- **Exposed Modules**: Components/pages the plugin provides

#### 2. Plugin Extensions (`plugin-extensions.ts`)

Defines **how** the plugin extends the console:

```typescript
const extensions: EncodedExtension[] = [
  // Navigation: Add "Migration" section to menu
  {
    type: 'console.navigation/section',
    properties: {
      id: 'migration',
      name: 'Migration for Virtualization',
      insertAfter: ['virtualization', 'workloads'],
    },
  },
  
  // Resource List: Show providers list page
  {
    type: 'console.page/resource/list',
    properties: {
      model: ProviderModelGroupVersionKind,
      component: { $codeRef: 'ProvidersListPage' },
    },
  },
  
  // Resource Details: Show provider details page
  {
    type: 'console.page/resource/details',
    properties: {
      model: ProviderModelGroupVersionKind,
      component: { $codeRef: 'ProviderDetailsPage' },
    },
  },
];
```

**Extension Types:**
- **Navigation**: Add menu items/sections
- **Pages**: Add list/detail pages for resources
- **Actions**: Add buttons/actions to resources
- **Models**: Register Kubernetes resource types
- **Routes**: Define custom routes

#### 3. ConsoleRemotePlugin (Webpack Plugin)

The `@openshift-console/dynamic-plugin-sdk-webpack` package provides a Webpack plugin that:

1. **Generates Manifest**: Creates plugin manifest JSON
2. **Code Splitting**: Automatically splits code into chunks
3. **Module Federation**: Sets up module federation for dynamic loading
4. **Asset Handling**: Processes assets for plugin distribution

**How It Works:**
- Reads `plugin-metadata.ts` and `plugin-extensions.ts`
- Generates webpack entry points for exposed modules
- Creates manifest file that console reads
- Bundles code with proper module federation setup

### Plugin Loading Process

1. **Console Startup**:
   - Console reads `ConsolePlugin` CRDs (Custom Resource Definitions)
   - Discovers available plugins

2. **Plugin Registration**:
   - Console loads plugin manifest
   - Validates plugin dependencies
   - Registers plugin extensions

3. **Runtime Loading**:
   - When user navigates to plugin route, console:
     - Fetches plugin JavaScript bundles
     - Loads modules via module federation
     - Renders plugin components

4. **API Proxy**:
   - Console proxies API requests for plugins
   - Handles authentication/authorization
   - Routes to backend services

### Plugin Deployment

**In Production:**
1. Plugin is built: `yarn build` → creates `dist/` directory
2. Containerized: Dockerfile copies `dist/` into container
3. Deployed: As Kubernetes Deployment/Service
4. Registered: ConsolePlugin CRD points to plugin service
5. Loaded: Console fetches and loads plugin dynamically

**Development:**
1. Plugin runs on `localhost:9001` (webpack-dev-server)
2. Console runs on `localhost:9000` (via `yarn console`)
3. Console configured to load plugin from `localhost:9001`
4. Hot reloading works for both console and plugin

---

## Frontend Architecture

### React Component Hierarchy

The plugin uses **React** for UI components, organized by feature:

```
App (OpenShift Console)
└── Forklift Plugin
    ├── Overview Page
    ├── Providers Module
    │   ├── ProvidersListPage
    │   ├── ProviderDetailsPage
    │   └── ProvidersCreatePage
    ├── Plans Module
    │   ├── PlansListPage
    │   ├── PlanDetailsPage
    │   └── PlanCreateWizard
    ├── NetworkMaps Module
    └── StorageMaps Module
```

### State Management

**React Hooks Pattern:**
- Uses React hooks (`useState`, `useEffect`, `useCallback`) for local state
- Custom hooks for data fetching (`useProviderInventory`, `usePlans`, etc.)
- React Hook Form for form state management

**Example Custom Hook:**

```typescript
// useProviderInventory.ts
const useProviderInventory = <T>({
  provider,
  subPath,
  interval = 5000,
}) => {
  const [inventory, setInventory] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await consoleFetchJSON(
          getInventoryApiUrl(`providers/${type}/${uid}/${subPath}`)
        );
        setInventory(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const intervalId = setInterval(fetchData, interval);
    return () => clearInterval(intervalId);
  }, [provider, subPath]);

  return { inventory, loading, error };
};
```

### Component Patterns

**1. Page Components:**
- Top-level route components
- Handle data fetching
- Compose smaller components

**2. Presentational Components:**
- Reusable UI components
- Receive props, emit events
- No direct API calls

**3. Container Components:**
- Connect data to UI
- Handle business logic
- Use hooks for data fetching

**4. Form Components:**
- Use React Hook Form
- Validation with custom validators
- Multi-step wizards for complex forms

### TypeScript Type System

**Type Safety:**
- All components are TypeScript
- Types from `@kubev2v/types` package (shared with backend)
- Type-safe API calls
- Type-safe form handling

**Example:**

```typescript
import type { V1beta1Provider } from '@kubev2v/types';

const ProviderDetailsPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { provider } = useProvider(name, namespace);
  // TypeScript knows provider is V1beta1Provider | undefined
  // Autocomplete and type checking work
};
```

---

## Backend Integration: Connecting to MTV

### Migration Toolkit for Virtualization (MTV) Overview

**MTV (Forklift)** is a Kubernetes operator that:
1. **Manages Providers**: Connects to vSphere, oVirt, OpenStack, etc.
2. **Discovers Inventory**: Finds VMs, networks, storage from providers
3. **Creates Plans**: Defines migration plans
4. **Executes Migrations**: Moves VMs to OpenShift Virtualization

### Architecture Layers

```
┌─────────────────────────────────────────────────┐
│         OpenShift Web Console                   │
│  (Host Application - Port 9000)                  │
└──────────────┬──────────────────────────────────┘
               │
               │ HTTP/HTTPS
               │ Module Federation
               │
┌──────────────▼──────────────────────────────────┐
│    Forklift Console Plugin                      │
│    (Dynamic Plugin - Port 9001)                 │
│    - React Components                           │
│    - UI Logic                                   │
└──────────────┬──────────────────────────────────┘
               │
               │ API Proxy
               │ /api/proxy/plugin/forklift-console-plugin/*
               │
┌──────────────▼──────────────────────────────────┐
│         OpenShift Console Backend                │
│         (Bridge/Proxy Layer)                    │
└──────────────┬──────────────────────────────────┘
               │
               │ Kubernetes API
               │ /api/kubernetes/apis/forklift.konveyor.io/v1beta1/*
               │
┌──────────────▼──────────────────────────────────┐
│         Kubernetes API Server                    │
│         (Kubernetes Control Plane)              │
└──────────────┬──────────────────────────────────┘
               │
               │ CRD Operations
               │ (Create, Read, Update, Delete)
               │
┌──────────────▼──────────────────────────────────┐
│         MTV Operator                            │
│         (Forklift Controller)                   │
│    - Watches CRDs                               │
│    - Manages Providers                          │
│    - Executes Migrations                        │
└──────────────┬──────────────────────────────────┘
               │
               │ Inventory API
               │ /forklift-inventory/providers/*/vms
               │
┌──────────────▼──────────────────────────────────┐
│         Forklift Inventory Service              │
│         (Discovery & Inventory)                │
│    - Connects to vSphere/oVirt/etc.            │
│    - Discovers VMs, networks, storage           │
│    - Provides inventory API                     │
└─────────────────────────────────────────────────┘
```

### API Communication Flow

#### 1. Kubernetes API (CRD Operations)

**What:** Direct Kubernetes resource operations  
**How:** Via OpenShift Console's Kubernetes API proxy  
**Endpoints:**

```typescript
// Providers
GET    /api/kubernetes/apis/forklift.konveyor.io/v1beta1/providers
POST   /api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/{ns}/providers
GET    /api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/{ns}/providers/{name}
PATCH  /api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/{ns}/providers/{name}
DELETE /api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/{ns}/providers/{name}

// Plans
GET    /api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/{ns}/plans
POST   /api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/{ns}/plans

// Network Maps
GET    /api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/{ns}/networkmaps

// Storage Maps
GET    /api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/{ns}/storagemaps
```

**Usage Example:**

```typescript
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

// Fetch providers
const providers = await consoleFetchJSON(
  '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/providers'
);

// Create a provider
await consoleFetchJSON(
  `/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/${namespace}/providers`,
  'POST',
  { body: JSON.stringify(providerSpec) }
);
```

#### 2. Inventory API (Discovery Data)

**What:** Provider inventory (VMs, networks, storage)  
**How:** Via plugin proxy to Forklift Inventory Service  
**Endpoints:**

```typescript
// Plugin proxy path pattern:
/api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers/{type}/{uid}/{resource}

// Examples:
GET /api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers/vsphere/vm-123/vms
GET /api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers/vsphere/vm-123/networks
GET /api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers/vsphere/vm-123/datastores
GET /api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers/vsphere/vm-123/hosts
```

**Helper Function:**

```typescript
// src/modules/Providers/utils/helpers/getApiUrl.ts
export const getInventoryApiUrl = (relativePath = ''): string => {
  const pluginPath = `/api/proxy/plugin/${process.env.PLUGIN_NAME}`;
  return `${pluginPath}/forklift-inventory/${relativePath}`;
};

// Usage:
const vms = await consoleFetchJSON(
  getInventoryApiUrl(`providers/vsphere/${providerUid}/vms`)
);
```

**Why Separate API?**
- **CRDs**: Configuration/resources (providers, plans, maps)
- **Inventory**: Discovery data (VMs, networks) - too large/volatile for CRDs
- **Performance**: Inventory API optimized for large datasets
- **Real-time**: Inventory updates frequently, CRDs are state

#### 3. Services API (Additional Services)

**What:** Additional Forklift services (must-gather, etc.)  
**How:** Via plugin proxy  
**Endpoints:**

```typescript
/api/proxy/plugin/forklift-console-plugin/forklift-services/{path}
```

### Authentication & Authorization

**How It Works:**
1. User logs into OpenShift Console
2. Console handles authentication (OAuth, service accounts, etc.)
3. Console backend (Bridge) adds auth headers to API requests
4. Plugin uses `consoleFetchJSON` which automatically includes auth
5. Kubernetes API validates user permissions (RBAC)
6. Inventory service validates via Kubernetes service account

**No Direct Auth in Plugin:**
- Plugin doesn't handle login
- Plugin doesn't store credentials
- All auth handled by console backend
- Plugin just makes API calls with console's auth context

### Data Flow Example: Creating a Migration Plan

**Step-by-Step Flow:**

1. **User Fills Form** (React Hook Form):
   ```typescript
   const formData = {
     planName: 'migrate-web-servers',
     sourceProvider: 'vsphere-provider-1',
     targetProvider: 'openshift-provider',
     vms: ['vm-123', 'vm-456'],
     networkMapping: 'net-map-1',
     storageMapping: 'storage-map-1',
   };
   ```

2. **Fetch Source VMs** (Inventory API):
   ```typescript
   const vms = await consoleFetchJSON(
     getInventoryApiUrl(`providers/vsphere/${sourceProviderUid}/vms`)
   );
   // Returns: [{ id: 'vm-123', name: 'web-server-1', ... }, ...]
   ```

3. **Fetch Target Networks** (Inventory API):
   ```typescript
   const networks = await consoleFetchJSON(
     getInventoryApiUrl(`providers/openshift/${targetProviderUid}/networkattachmentdefinitions`)
   );
   // Returns: [{ uid: 'net-1', name: 'pod-network', ... }, ...]
   ```

4. **Create Plan CRD** (Kubernetes API):
   ```typescript
   const plan = {
     apiVersion: 'forklift.konveyor.io/v1beta1',
     kind: 'Plan',
     metadata: { name: formData.planName, namespace: 'default' },
     spec: {
       provider: { source: sourceProviderUid, destination: targetProviderUid },
       vms: formData.vms.map(id => ({ id })),
       map: {
         network: { name: formData.networkMapping },
         storage: { name: formData.storageMapping },
       },
     },
   };
   
   await consoleFetchJSON(
     `/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/default/plans`,
     'POST',
     { body: JSON.stringify(plan) }
   );
   ```

5. **MTV Operator Watches**:
   - Operator sees new Plan CRD
   - Validates plan configuration
   - Creates Migration CRDs
   - Starts migration process

6. **UI Polls Status**:
   ```typescript
   useEffect(() => {
     const interval = setInterval(async () => {
       const plan = await consoleFetchJSON(
         `/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/default/plans/${planName}`
       );
       setPlanStatus(plan.status);
     }, 5000);
     return () => clearInterval(interval);
   }, [planName]);
   ```

### Error Handling

**API Error Patterns:**

```typescript
try {
  const data = await consoleFetchJSON(url);
  // Success
} catch (error) {
  if (error.code === 404) {
    // Resource not found
  } else if (error.code === 403) {
    // Permission denied
  } else if (error.code === 500) {
    // Server error
  }
  // Show error to user
}
```

**Network Errors:**
- Timeout handling
- Retry logic
- Offline detection
- User-friendly error messages

---

## Data Flow and API Communication

### Real-Time Updates

**Polling Pattern:**
- Components poll APIs at intervals (default: 5 seconds)
- `useProviderInventory` hook handles polling automatically
- Updates UI when data changes

**WebSocket Alternative:**
- Not currently used
- Could be added for real-time updates
- Would reduce server load vs polling

### Caching Strategy

**Client-Side Caching:**
- React state caches API responses
- `useMemo` for expensive computations
- Avoids unnecessary re-renders

**No Server-Side Cache:**
- All data fetched fresh from APIs
- Inventory data changes frequently
- CRD data is source of truth

### API Request Lifecycle

```
User Action
    ↓
React Component
    ↓
Custom Hook (useProviderInventory, etc.)
    ↓
consoleFetchJSON (Console SDK)
    ↓
OpenShift Console Backend (Bridge)
    ↓
Kubernetes API Server OR Plugin Proxy
    ↓
MTV Operator OR Inventory Service
    ↓
Response flows back up
    ↓
React State Update
    ↓
UI Re-render
```

### Type Safety Across Layers

**Shared Types:**
- `@kubev2v/types` package defines types
- Used by both frontend and backend
- Ensures API contract compliance
- TypeScript catches mismatches at compile time

**Example:**

```typescript
// Shared type definition
export interface V1beta1Provider {
  apiVersion: 'forklift.konveyor.io/v1beta1';
  kind: 'Provider';
  metadata: {
    name: string;
    namespace: string;
    uid: string;
  };
  spec: {
    type: 'vsphere' | 'ovirt' | 'openstack' | 'openshift';
    url: string;
    secret: { name: string };
  };
  status?: {
    conditions: Array<{ type: string; status: string }>;
  };
}

// Frontend uses it
const provider: V1beta1Provider = await consoleFetchJSON(url);

// TypeScript ensures structure matches
```

---

## Development Workflow

### Local Development Setup

**1. Install Dependencies:**
```bash
yarn install
```
- Reads `package.json` and `yarn.lock`
- Downloads packages from npm registry
- Installs to `node_modules/`

**2. Start Development Server:**
```bash
yarn start
```
- Runs webpack-dev-server on port 9001
- Hot module replacement enabled
- TypeScript compilation on-the-fly
- Source maps for debugging

**3. Start Console (Separate Terminal):**
```bash
yarn console
```
- Starts OpenShift Console on port 9000
- Configured to load plugin from localhost:9001
- Uses local Kubernetes cluster (or remote)

**4. Development Flow:**
```
Edit Code (src/**/*.tsx)
    ↓
Webpack Recompiles
    ↓
Hot Module Replacement
    ↓
Browser Auto-Reloads
    ↓
See Changes Instantly
```

### Build Process

**Development Build:**
```bash
yarn start
```
- Fast compilation
- Source maps
- Unminified code
- Development optimizations

**Production Build:**
```bash
yarn build
```
- TypeScript compilation
- Code minification
- Tree shaking (removes unused code)
- Asset optimization
- Output to `dist/` directory

**Build Output:**
```
dist/
├── plugin-manifest.json          # Plugin metadata
├── [name]-bundle-[hash].min.js   # Main JavaScript bundles
├── [name]-chunk-[hash].min.js    # Code-split chunks
├── assets/                        # Images, fonts, etc.
└── locales/                      # Translation files
```

### Testing

**Unit Tests:**
```bash
yarn test
```
- Jest test runner
- React Testing Library
- Component testing
- Utility function testing

**E2E Tests:**
```bash
yarn test:e2e
```
- Playwright for browser automation
- Full user flow testing
- API mocking
- Screenshot comparison

### Code Quality

**Linting:**
```bash
yarn lint
```
- ESLint for JavaScript/TypeScript
- Stylelint for CSS
- Pre-commit hooks (Husky)
- Auto-fix on commit (lint-staged)

**Type Checking:**
- TypeScript compiler
- ForkTsCheckerWebpackPlugin (parallel checking)
- Catches type errors during development

### Deployment

**Container Build:**
```dockerfile
# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Runtime stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

**Kubernetes Deployment:**
1. Build container image
2. Push to registry (Quay.io)
3. Deploy as Kubernetes Deployment
4. Create Service
5. Register ConsolePlugin CRD
6. Console loads plugin automatically

---

## Summary: The Complete Picture

### How Everything Connects

1. **Package Management (npm/yarn)**:
   - Manages dependencies
   - Defines build scripts
   - Locks versions for reproducibility

2. **Build System (Webpack)**:
   - Bundles TypeScript/React code
   - Processes assets
   - Generates plugin manifest

3. **Plugin Architecture (OpenShift SDK)**:
   - Defines plugin metadata
   - Registers extensions
   - Enables dynamic loading

4. **Frontend (React)**:
   - UI components
   - State management
   - User interactions

5. **API Communication**:
   - Kubernetes API for CRDs
   - Inventory API for discovery
   - Console proxy handles auth

6. **Backend (MTV Operator)**:
   - Watches CRDs
   - Manages providers
   - Executes migrations
   - Provides inventory API

### Key Takeaways

- **Separation of Concerns**: UI (plugin) vs Logic (operator) vs Data (Kubernetes)
- **Type Safety**: TypeScript ensures correctness across layers
- **Dynamic Loading**: Plugin loads without console modification
- **API Proxy**: Console handles auth, plugin just makes requests
- **Real-time Updates**: Polling keeps UI in sync with backend
- **Developer Experience**: Hot reloading, type checking, linting

### Architecture Benefits

1. **Modularity**: Plugin can be developed/deployed independently
2. **Scalability**: Can add more plugins without console changes
3. **Security**: Console handles all authentication
4. **Type Safety**: Shared types prevent API mismatches
5. **Performance**: Code splitting, lazy loading, caching
6. **Maintainability**: Clear separation, well-defined interfaces

---

## Additional Resources

- [OpenShift Console Dynamic Plugin SDK](https://github.com/openshift/dynamic-plugin-sdk)
- [Migration Toolkit for Virtualization](https://github.com/kubev2v/forklift)
- [PatternFly Design System](https://www.patternfly.org/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Webpack Documentation](https://webpack.js.org/)
- [Yarn Documentation](https://yarnpkg.com/)

---

*This guide provides a comprehensive overview of the Forklift Console Plugin architecture. For specific implementation details, refer to the source code and inline documentation.*




