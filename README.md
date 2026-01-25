# IC Decentralised Audit

Demo URL: https://gtn6w-niaaa-aaaam-afxaa-cai.
A production-ready audit logging application for the Internet Computer (IC) with a Motoko backend and Angular 21 frontend. Demonstrates immutable data structures, modern Angular patterns, and Material Design UI.

## Project Structure

```
icLogging/
├── dfx.json                 # DFX project configuration
├── mops.toml               # Motoko package manager configuration
├── src/
│   ├── backend/
│   │   └── main.mo         # Motoko backend canister (immutable map-based storage)
│   └── frontend/           # Angular 21 frontend application
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/
│       │   │   │   ├── logging/              # Main logging view component
│       │   │   │   ├── logging-table/        # Table component with sorting
│       │   │   │   ├── logging-add-dialog/    # Dialog for adding logs
│       │   │   │   ├── logging-detail-dialog/# Dialog for viewing log details
│       │   │   │   └── info-dialog/           # About/Info modal
│       │   │   ├── services/
│       │   │   │   ├── ic-agent.service.ts    # IC agent initialization
│       │   │   │   ├── logging.service.ts    # Logging API service
│       │   │   │   └── log-level.service.ts  # Shared log level utilities
│       │   │   ├── app.component.*           # Root component
│       │   │   └── environments/             # Environment configuration
│       │   ├── styles.scss                   # Global styles
│       │   └── main.ts                       # Application entry point
│       ├── angular.json
│       ├── package.json
│       └── tsconfig.json
└── declarations/           # Generated TypeScript bindings from Candid
    └── backend/
        └── backend.did.ts
```

## Prerequisites

- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install/) installed
- Node.js 20+ and npm installed
- Angular CLI 21 installed globally: `npm install -g @angular/cli@21`

## Setup Instructions

1. **Install DFX** (if not already installed):
   ```bash
   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
   ```

2. **Install frontend dependencies**:
   ```bash
   npm run install:frontend
   ```

3. **Generate backend DID file**:
   ```bash
   dfx generate backend
   ```
   This will create the TypeScript bindings for the backend canister.

4. **Configure frontend environment files**:
   Set the `backendCanisterId` and `backendAuthKey` in both environment files:
   
   - `src/frontend/src/environments/environment.ts` (development)
   - `src/frontend/src/environments/environment.prod.ts` (production)
   
   ```typescript
   export const environment = {
     production: false, // or true for prod
     backendCanisterId: 'your-canister-id-here',
     backendAuthKey: 'your-secret-key-here'
   };
   ```
   
   **Note**: The `backendAuthKey` must match the key you'll set in the backend after deployment (see step 3 in Development section).

## Development

1. **Start the local Internet Computer network**:
   ```bash
   dfx start
   ```
   Keep this terminal running.

2. **Deploy the canisters** (in a new terminal):
   ```bash
   dfx deploy
   ```
   This will:
   - Compile and deploy the Motoko backend canister
   - Build the Angular frontend
   - Deploy the frontend as an assets canister

3. **Set the authentication key** (required before adding logs):
   After deployment, you must set the authentication key using the `setAuthKey` function. This can only be called by the canister controller (installer).
   
   ```bash
   dfx canister call backend setAuthKey ""
   ```
   
   **Important**: 
   - Only the canister controller can call `setAuthKey`
   - The key must match the `backendAuthKey` in your frontend environment files
   - Set the same key in both `environment.ts` (development) and `environment.prod.ts` (production)

4. **Access the application**:
   - Frontend: Open the URL shown in the terminal (typically `http://localhost:8080`)
   - Backend canister ID will be displayed after deployment

## Development Workflow

### Backend Development

Edit `src/backend/main.mo` and redeploy:
```bash
dfx deploy backend
```

### Frontend Development

For frontend development with hot-reload:

1. Start DFX in one terminal:
   ```bash
   dfx start
   ```

2. Deploy backend only:
   ```bash
   dfx deploy backend
   ```

3. Run Angular dev server in another terminal:
   ```bash
   cd src/frontend
   npm start
   ```

4. Access the app at `http://localhost:4200`

**Note**: When running the Angular dev server, the backend canister ID is automatically configured from the environment. The `IcAgentService` reads the canister ID from `environment.backendCanisterId` and detects the network (local vs. mainnet) automatically.

### Building for Production

Create canister in subnet
```bash
## first canister creation commands
dfx canister create backend --ic --with-cycles 1T --subnet 4ecnw-byqwz-dtgss-ua2mh-pfvs7-c3lct-gtf4e-hnu75-j7eek-iifqm-sqe
## 2nn3mi-waaaa-aaaam-afw7q-cai

dfx canister create frontend --ic --with-cycles 1T --subnet 4ecnw-byqwz-dtgss-ua2mh-pfvs7-c3lct-gtf4e-hnu75-j7eek-iifqm-sqe
## gtn6w-niaaa-aaaam-afxaa-cai
```

Build the frontend for deployment:
```bash
npm run build
```

Then deploy:
```bash
dfx deploy
```

## Technology Stack

### Backend
- **Motoko**: Internet Computer's native language
- **Motoko Core Library**: Using `mo:core/pure/Map` for immutable, ordered map storage
- **Persistent Actor**: State persists across upgrades
- **1-based indexing**: Audit entries start at ID 1

### Frontend
- **Angular 21**: Latest Angular with standalone components
- **Angular Material 21**: Material Design components
- **TypeScript 5.9**: Type-safe development
- **ICP SDK 5.0**: `@icp-sdk/core` for IC agent communication
- **RxJS 7.8**: Reactive programming
- **Signals**: Angular's new reactive primitives

## Backend API

The Motoko backend uses immutable data structures and provides the following methods:

### Configuration
- `setAuthKey(key: Text) : async ()` - Set the authentication key (only callable by canister controller/installer)
  - **Security**: Only the canister controller can call this function
  - **Required**: Must be called after deployment before adding any log entries
  - **Usage**: `dfx canister call backend setAuthKey "your-secret-key-here"`

### Audit Operations
- `log(key: Text, level: Text, message: Text) : async Nat` - Add an audit entry (returns the new entry ID)
  - Requires the `key` parameter to match the configured `authKey`
- `getLogs() : async [LogEntry]` - Get all audit entries (ordered by ID)
- `getLog(id: Nat) : async ?LogEntry` - Get a specific audit entry by ID
- `getLogCount() : async Nat` - Get the total number of audit entries

**Note**: 
- Audit entries are immutable and cannot be deleted. This ensures a complete audit trail.
- The authentication key must be set via `setAuthKey` before any audit entries can be added.

### LogEntry Type
```motoko
type LogEntry = {
  id: Nat;
  timestamp: Int;
  level: Text;
  message: Text;
};
```

## Frontend Features

### Core Functionality
- **Audit Table**: Sortable table with columns for ID, Date/Time, and Level
- **Add Audit Entries**: Dialog-based form to add new audit entries with level selection
- **View Details**: Click any row to view full audit entry details in a modal
- **Refresh**: Manual refresh button to reload audit entries from the backend
- **About Dialog**: Information about the application and technology stack

### UI/UX Features
- **Material Design 21**: Modern, accessible UI components
- **Responsive Design**: Works on desktop and mobile devices
- **Sortable Columns**: Sort by ID, Date, or Level (default: ID descending)
- **Visual Indicators**: Color-coded icons for each audit level
- **Error Handling**: User-friendly error messages via snackbar notifications
- **Loading States**: Spinner indicators during async operations
- **Accessibility**: ARIA labels and keyboard navigation support

### Components
- `LoggingComponent`: Main container component
- `LoggingTableComponent`: Sortable table with row click handlers
- `LoggingAddDialogComponent`: Modal dialog for adding new audit entries
- `LoggingDetailDialogComponent`: Modal dialog for viewing audit entry details
- `InfoDialogComponent`: About/Information modal

### Services
- `IcAgentService`: Manages IC agent initialization and actor creation
- `LoggingService`: Handles all backend API calls for audit operations
- `LogLevelService`: Shared utility for audit level colors and icons
- `DateFormatService`: Utility service for formatting timestamps

### Production Features
- **Memory Management**: Proper subscription cleanup with `takeUntil` pattern
- **Error Handling**: Comprehensive error handling with user feedback
- **Type Safety**: Full TypeScript type coverage
- **Null Safety**: Defensive programming with null checks
- **Accessibility**: ARIA labels and semantic HTML

## Deployment to Mainnet

1. Ensure you have cycles in your wallet
2. Deploy to mainnet:
   ```bash
   dfx deploy --network ic
   ```

3. **Set the authentication key** (required after mainnet deployment):
   ```bash
   dfx canister call backend setAuthKey "your-secret-key-here" --network ic
   ```
   
   **Note**: Make sure to set the same key in your production environment file (`environment.prod.ts`).

## Architecture

### Data Flow
1. User interacts with Angular frontend (adds audit entry, views details, etc.)
2. Frontend service (`LoggingService`) calls IC agent service
3. IC agent service (`IcAgentService`) manages actor connection to backend canister
4. Backend canister processes request using immutable map storage
5. Response flows back through the chain to update the UI

### State Management
- **Backend**: Immutable ordered map (`Map.Map<Nat, LogEntry>`) ensures data integrity
- **Frontend**: Angular Signals for reactive state management
- **Component Communication**: Event emitters and service injection

### Key Design Decisions
- **Immutable Audit Entries**: Audit entries cannot be deleted, ensuring complete audit trail
- **Ordered Storage**: Map automatically maintains order by ID
- **Standalone Components**: Modern Angular architecture without NgModules
- **Service Layer**: Separation of concerns with dedicated services
- **Error Boundaries**: Comprehensive error handling at all levels

## External Agent Integration

The backend API is accessible from any IC-compatible agent. In addition to the web UI, you can add audit entries programmatically using:

- **Node.js**: Using `@icp-sdk/core` or `@dfinity/agent`
- **Go**: Using `github.com/dfinity/go-icp-sdk`
- **Rust**: Using `ic-agent` crate
- **Python**: Using `ic-py` library

Example usage from external agents is documented in the About dialog within the application.

## Troubleshooting

- **Canister ID not found**: Run `dfx deploy` first to create the canisters, then check `environment.ts`
- **DID file errors**: Run `dfx generate backend` to regenerate TypeScript bindings
- **Frontend build errors**: Ensure all dependencies are installed with `npm run install:frontend`
- **Port conflicts**: Change the port in `dfx.json` or stop other services using port 8080
- **Network errors**: Ensure DFX is running (`dfx start`) and canisters are deployed
- **Type errors**: Regenerate DID files with `dfx generate backend` after backend changes
- **Authentication errors when adding audit entries**: 
  - Ensure `setAuthKey` has been called after deployment: `dfx canister call backend setAuthKey "your-key"`
  - Verify the `backendAuthKey` in your environment files matches the key set in the backend
  - Only the canister controller can call `setAuthKey` - check your DFX identity with `dfx identity whoami`
