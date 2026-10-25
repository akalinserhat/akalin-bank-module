# @akalin/bank_module

Standalone TCMB Bank & Branch Management Module for the Akalin ecosystem and Webakus ERP applications.

## Features
- **Official TCMB Bank Directory**: Lists all Turkish official central bank bank entities with EFT code and branch count.
- **Branch Directory**: Branch search, filtering, and active/passive status toggle.
- **TCMB Sync Engine**: One-click live sync from TCMB with progress reporting via `SyncProgressModal`.
- **Zero Monolithic Dependencies**: Full abstraction through `IBankServiceAdapter` (REST and LocalStorage adapters provided out of the box).
- **Module Core Compliant**: Registers automatically into `@akalin/module_core` via `createBankModule()`.

## Installation & Usage

```tsx
import { createBankModule, createRestBankAdapter } from '@akalin/bank_module';

const bankModule = createBankModule({
  appName: 'Webakus ERP',
  adapter: createRestBankAdapter()
});
```
