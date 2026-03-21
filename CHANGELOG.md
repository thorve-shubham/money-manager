# Changelog

All notable changes to Money Manager are documented here.
Format: `[version] — date — description`

---

## [0.1.0] — 2026-03-20 — Foundation

Initial project scaffold with theme system, navigation, and core components.

### Added
- F-001: Project scaffold — Expo 55, TypeScript strict, expo-router file-based routing
- F-002: Theme system — full light/dark palette, spacing scale, typography scale, ThemeProvider + useTheme hook
- F-003: Core components — ThemedText (variant/size/weight), ThemedView (surface variants), TabBarIcon (SF Symbols)
- F-004: 4-tab navigation — Dashboard, Accounts, Credit Cards, Settings with themed tab bar
- F-005: Settings screen — dark/light mode toggle wired to theme context
- F-006: App constants — APP_NAME, DEFAULT_CURRENCY (INR), DEFAULT_LOCALE (en-IN)
- F-007: Test suite — component and theme context tests using jest-expo + @testing-library/react-native
- F-008: Screen header titles — explicit titles on all tab stacks

---

## [0.4.0] — 2026-03-21 — Accounts CRUD

Add, edit, and delete accounts with form validation.

### Added
- F-011: `accountService` — CRUD operations via Drizzle ORM (`src/services/account-service.ts`)
- F-011: `validateAccountForm` — pure validation utility (`src/utils/account-validation.ts`)
- F-011: `useAccounts` hook — list state + delete + refresh (`src/hooks/use-accounts.ts`)
- F-011: `AccountCard` component — account row with edit/delete actions
- F-011: `AccountForm` component — shared add/edit form with inline validation
- F-011: `AccountTypeSelector` component — pill selector for savings/current/wallet/fd
- F-011: Add Account screen (`src/app/(tabs)/accounts/add.tsx`)
- F-011: Edit Account screen (`src/app/(tabs)/accounts/[id].tsx`)
- F-011: Accounts list screen with FAB and empty state (`src/app/(tabs)/accounts/index.tsx`)
- F-011: 47 new tests across service, hook, validation, and component layers
- F-011: Feature plan archived to `.claude/plans/features/F-011_accounts_crud.md`

---

## [0.3.0] — 2026-03-21 — Accounts Schema

Accounts data model, SQLite table, and migration.

### Added
- F-010: `accounts` DB table — migration `0002_accounts`, Drizzle schema in `src/db/schema/index.ts`
- F-010: 6 migration tests in `src/__tests__/db/accounts-migration.test.ts`
- F-010: Feature plan archived to `.claude/plans/features/F-010_accounts_schema.md`

---

## [0.2.0] — 2026-03-21 — Database Layer

Local SQLite database with Drizzle ORM and a custom migration runner.

### Added
- F-009: expo-sqlite + drizzle-orm installed
- F-009: Custom migration runner (`src/db/migrator.ts`) — tracks applied migrations in `__migrations` table, runs pending migrations in order on app startup
- F-009: `DatabaseProvider` (`src/db/provider.tsx`) — wraps app between ThemeProvider and RootStack, blocks render until migrations complete, shows loading/error states
- F-009: Initial schema — `categories` table (`src/db/schema/index.ts`, migration `0001_initial_schema`)
- F-009: DB test suite — migrator tests (5) + DatabaseProvider tests (5)
- F-009: Feature plan archived to `.claude/plans/features/F-009_database_layer.md`

### Changed
- Default currency corrected from INR to GBP (`src/constants/app.ts`)
