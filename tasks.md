# Implementation Plan: Expense & Budget Visualizer

## Overview

The implementation follows the design's single-source-of-truth + imperative re-render architecture. All production code lives in three files: `index.html` (structure), `css/styles.css` (styling), and `js/app.js` (logic, storage, views, controller). The pure logic layer is built first and validated with property-based tests using fast-check, then the storage/theme infrastructure, view renderers, and controller are layered on top. CSS theming is applied via CSS variables driven by a `data-theme` attribute on the document root. Testing uses Vitest with jsdom for DOM tests and fast-check for property-based tests on the pure logic layer. Pure functions are exported as ES module exports so they can be imported and tested in isolation.

## Tasks

- [ ] 1. Set up project structure and test framework
  - [ ] 1.1 Create directory structure, index.html, app.js skeleton, and test config
    - Create `index.html` with semantic markup: page title, and sections for balance display, input form (item name, amount, category select), transaction list container, chart canvas, and summary view
    - Link `css/styles.css` in the head and load `js/app.js` with `defer`
    - Create `css/styles.css` as a placeholder
    - Create `js/app.js` with IIFE wrapper and commented section headers (constants, pure logic, Storage_Manager, Theme_Manager, views, AppController)
    - Set up `package.json` with dev dependencies: `vitest`, `fast-check`, `jsdom`
    - Create `vitest.config.js` configured with jsdom environment and `--run` mode
    - _Requirements: 10.3, 10.4, 11.2_

- [ ] 2. Implement pure logic: validation and balance
  - [ ] 2.1 Implement validation helpers, validateTransaction, and computeBalance
    - Implement `isNonEmpty(str)` returning true if the string is non-empty after trimming
    - Implement `isPositiveAmount(value)` returning true if the value is a finite number greater than zero
    - Implement `validateTransaction(formValues)` returning `{valid, errors[]}`: reject if any field is empty or whitespace-only, reject if amount is non-numeric, zero, or negative
    - Implement `computeBalance(transactions)` returning the sum of all transaction amounts (0 for empty list)
    - Export pure functions as ES module exports so they are testable in isolation with Vitest
    - _Requirements: 1.4, 1.5, 3.1, 3.4_
  - [ ]\* 2.2 Write property test for transaction validation correctness
    - **Property 3: Transaction validation correctness**
    - **Validates: Requirements 1.4, 1.5**
    - Use fast-check with minimum 100 iterations; test that validateTransaction accepts iff all fields non-empty after trimming and amount is finite positive; rejection produces no transaction
    - Tag test with comment: `// Feature: expense-budget-visualizer, Property 3: Transaction validation correctness`
  - [ ]\* 2.3 Write property test for balance equals sum of amounts
    - **Property 6: Balance equals the sum of amounts**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - Use fast-check with minimum 100 iterations; test that computeBalance equals the sum of all amounts and returns 0 for the empty list
    - Tag test with comment: `// Feature: expense-budget-visualizer, Property 6: Balance equals the sum of amounts`

- [ ] 3. Implement pure logic: aggregation and summary
  - [ ] 3.1 Implement aggregateByCategory, groupByMonth, and summarizeMonth
    - Implement `aggregateByCategory(transactions)` returning one total per category present in the list; sum of all category totals equals total balance
    - Implement `groupByMonth(transactions)` assigning each transaction to exactly one month group (calendar month derived from ISO date); create a group only for months with at least one transaction
    - Implement `summarizeMonth(monthTransactions)` returning the month total and per-category breakdown where the sum of per-category totals equals the month total
    - _Requirements: 4.1, 7.1, 7.2, 7.3_
  - [ ]\* 3.2 Write property test for category aggregation confluence
    - **Property 7: Category aggregation confluence**
    - **Validates: Requirements 4.1**
    - Use fast-check with minimum 100 iterations; test one total per category and sum of all category totals equals total balance
    - Tag test with comment: `// Feature: expense-budget-visualizer, Property 7: Category aggregation confluence`
  - [ ]\* 3.3 Write property test for monthly partition
    - **Property 11: Monthly partition**
    - **Validates: Requirements 7.1, 7.3**
    - Use fast-check with minimum 100 iterations; test every transaction assigned to exactly one month, only months with at least one transaction appear, sum of month totals equals total balance
    - Tag test with comment: `// Feature: expense-budget-visualizer, Property 11: Monthly partition`
  - [ ]\* 3.4 Write property test for monthly summary totals
    - **Property 12: Monthly summary totals**
    - **Validates: Requirements 7.2**
    - Use fast-check with minimum 100 iterations; test month total equals sum of that month's transactions and per-category breakdown sum equals month total
    - Tag test with comment: `// Feature: expense-budget-visualizer, Property 12: Monthly summary totals`

- [ ] 4. Implement pure logic: categories, serialization, state mutators, and theme toggle
  - [ ] 4.1 Implement validateCategoryName, category selector builder, serialize/deserialize, state mutators, and theme toggle
    - Implement `validateCategoryName(name, existingCategories, customCount)` returning `{valid, reason}`: accept iff name length is 1 to 50, not whitespace-only, not a duplicate of any existing category, and customCount is less than 20
    - Implement `buildCategorySelector(customCategories)` returning the concatenation of defaults (Food, Transport, Fun) with custom categories, with no duplicates and no missing entries
    - Implement `serializeState(state)` JSON-stringifying the persistent subset (transactions, customCategories, theme)
    - Implement `deserializeTransactions(json)` returning `{ok, data, error}`: parse and schema-validate each entry via `isStoredTransaction` (must have string id, non-empty string itemName, finite positive amount, non-empty string category, valid ISO date); any failure returns ok:false with an error message and empty data
    - Implement `addTransaction(state, transaction)` appending a valid transaction so list length increases by exactly one and the new transaction is the last element
    - Implement `deleteTransaction(state, id)` removing the matching transaction so list length decreases by one, the target is removed, and every other transaction is preserved unchanged
    - Implement `toggleTheme(current)` returning the opposite theme (light to dark, dark to light)
    - _Requirements: 1.2, 1.3, 2.4, 5.1, 5.2, 5.5, 6.2, 8.1, 8.2, 8.5, 8.6_
  - [ ]\* 4.2 Write property test for category selector content
    - **Property 1: Category selector content**
    - **Validates: Requirements 1.2, 8.2**
    - Use fast-check with minimum 100 iterations; test selector contains exactly defaults plus customs with no duplicates and no missing entries
    - Tag test with comment: `// Feature: expense-budget-visualizer, Property 1: Category selector content`
  - [ ]\* 4.3 Write property test for valid submission grows the transaction list
    - **Property 2: Valid submission grows the transaction list**
    - **Validates: Requirements 1.3**
    - Use fast-check with minimum 100 iterations; test adding a valid transaction increases list length by exactly one and the new last element matches the submitted input
    - Tag test with comment: `// Feature: expense-budget-visualizer, Property 2: Valid submission grows the transaction list`
  - [ ]\* 4.4 Write property test for deletion removes exactly one transaction
    - **Property 5: Deletion removes exactly one transaction**
    - **Validates: Requirements 2.4**
    - Use fast-check with minimum 100 iterations; test deleting a transaction reduces length by one, removes the target, and preserves all other transactions unchanged
    - Tag test with comment: `// Feature: expense-budget-visualizer, Property 5: Deletion removes exactly one transaction`
  - [ ]\* 4.5 Write property test for state serialization round trip
    - **Property 8: State serialization round trip**
    - **Validates: Requirements 5.2, 8.4**
    - Use fast-check with minimum 100 iterations; test serialize then deserialize yields an equivalent state preserving every transaction, every custom category, and the theme value
    - Tag test with comment: `// Feature: expense-budget-visualizer, Property 8: State serialization round trip`
  - [ ]\* 4.6 Write property test for corrupt data rejection
    - **Property 9: Corrupt data rejection**
    - **Validates: Requirements 5.5**
    - Use fast-check with minimum 100 iterations; test malformed JSON or schema-invalid transactions are rejected (ok:false) and yield an empty transaction set
    - Tag test with comment: `// Feature: expense-budget-visualizer, Property 9: Corrupt data rejection`
  - [ ]\* 4.7 Write property test for theme toggle involution
    - **Property 10: Theme toggle involution**
    - **Validates: Requirements 6.2**
    - Use fast-check with minimum 100 iterations; test toggle produces the opposite theme and toggle(toggle(t)) equals t
    - Tag test with comment: `// Feature: expense-budget-visualizer, Property 10: Theme toggle involution`
  - [ ]\* 4.8 Write property test for custom category name validation
    - **Property 13: Custom category name validation**
    - **Validates: Requirements 8.1, 8.5, 8.6**
    - Use fast-check with minimum 100 iterations; test validateCategoryName accepts iff name is 1 to 50 chars, not whitespace-only, not a duplicate, and customCount is less than 20; any failing condition is rejected
    - Tag test with comment: `// Feature: expense-budget-visualizer, Property 13: Custom category name validation`

- [ ] 5. Checkpoint - Ensure all pure logic tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement storage and theme infrastructure
  - [ ] 6.1 Implement Storage_Manager and Theme_Manager
    - Implement `Storage_Manager.isAvailable()`: feature-detect `window.localStorage` and perform a write/read probe
    - Implement `loadTransactions()` returning `{ok, data, error}`: read and parse stored transactions via `deserializeTransactions`; on corrupt data return ok:false with error message
    - Implement `saveTransactions(transactions)` returning `{ok, error}`: serialize and write; on quota exceeded or unavailable, retain data in memory and return ok:false
    - Implement `loadCategories()` returning `{ok, data, error}`: load custom categories; on failure return defaults-only signal
    - Implement `saveCategories(categories)` returning `{ok, error}`: persist custom categories
    - Implement `loadTheme()` returning `{ok, data, error}` and `saveTheme(theme)` returning `{ok, error}`
    - Use storage keys: `ebv:transactions`, `ebv:categories`, `ebv:theme` (each value is a JSON string)
    - Wrap every method in try/catch and report errors through result types rather than throwing
    - Implement `Theme_Manager.applyTheme(theme)`: set `data-theme` attribute on the `<html>` element
    - Implement `Theme_Manager.defaultTheme()` returning `'light'`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.2, 6.5, 8.3, 8.4, 8.7, 11.3_
  - [ ]\* 6.2 Write unit tests for Storage_Manager error handling
    - Test unavailable localStorage (delete `window.localStorage`): app runs in-memory with persistence-unavailable message
    - Test quota exceeded (mock `setItem` throwing QuotaExceededError): in-memory data retained, save-failure message returned
    - Test corrupt stored JSON: app initializes empty with load-error message
    - Test category loading fallback to defaults-only when storage unavailable
    - _Requirements: 5.4, 5.5, 8.7, 11.3_

- [ ] 7. Implement view renderers
  - [ ] 7.1 Implement balance display, transaction list, and chart renderers
    - Implement `renderBalance(balance)`: format and display the total at the top of the interface; display zero when no transactions exist
    - Implement `renderTransactionList(transactions)`: build list via `DocumentFragment`, each row shows item name, amount, category, and a delete control with a `data-id` attribute matching the transaction id
    - Implement `renderEmpty()` for the transaction list: show a message indicating no transactions are available
    - Set up event delegation on the list container: a single listener reads the transaction id from the `data-id` attribute on the clicked delete control
    - Implement `renderChart(transactions)`: show empty-state message if no transactions, else draw a pie chart on `<canvas>` using `aggregateByCategory` and `drawPie(ctx, totals, palette)` with `arc()`
    - Include a legend mapping colors to category names
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 3.1, 3.4, 4.1, 4.3_
  - [ ]\* 7.2 Write unit test for transaction list rendering completeness
    - **Property 4: Transaction list rendering completeness**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Use jsdom; test that rendering produces exactly one row per transaction, and each row displays the item name, amount, category, and one delete control
    - Tag test with comment: `// Feature: expense-budget-visualizer, Property 4: Transaction list rendering completeness`
  - [ ] 7.3 Implement summary view, input form, category manager, and message renderers
    - Implement `renderSummary(transactions)`: list months that contain at least one transaction with their totals; show empty-state message if no transactions exist
    - Implement `renderMonthDetail(monthKey, transactions)`: show month total and per-category breakdown for the selected month
    - Implement `renderCategorySelector(allCategories)`: rebuild `<select>` options from defaults plus custom categories
    - Implement `readForm()`: read raw field values as strings (itemName, amount, category)
    - Implement `showFormErrors(errors[])`: render validation messages near the form
    - Implement `clearForm()`: reset all fields after a successful add
    - Implement `showCategoryError(message)`: render category rejection reason inline
    - Implement `renderMessages(messages)`: display inline non-blocking messages for storage and persistence errors
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 8.2, 8.5, 8.6, 8.7_

- [ ] 8. Checkpoint - Ensure all view tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement AppController and wire everything together
  - [ ] 9.1 Implement AppController with init, event wiring, and all handlers
    - Implement `init()`: on DOMContentLoaded, detect storage availability via `Storage_Manager.isAvailable()`, load persisted state (transactions, categories, theme), apply theme via `Theme_Manager.applyTheme`, render all views, and bind all event listeners
    - Implement `handleAddTransaction(formValues)`: validate via `validateTransaction`; on success generate a Transaction (id as `txn_${Date.now()}_${counter}`, trimmed itemName, parsed amount, selected category, ISO date), add to state via `addTransaction`, persist via `saveTransactions`, and re-render list, balance, chart, and summary; on failure show form errors without clearing the form
    - Implement `handleDeleteTransaction(id)`: remove via `deleteTransaction`, persist via `saveTransactions`, and re-render list, balance, chart, and summary
    - Implement `handleToggleTheme()`: flip theme via `toggleTheme`, persist via `saveTheme`, and apply via `applyTheme`
    - Implement `handleAddCategory(name)`: validate via `validateCategoryName`; on success add to `customCategories`, persist via `saveCategories`, and re-render selector; on failure show category error without modifying the selector
    - Implement `handleSelectMonth(monthKey)`: set `selectedMonth` in state and re-render month detail
    - Implement `render(what)`: selective re-render dispatcher accepting which views to update (balance, list, chart, summary, selector, theme)
    - Wire event listeners: form submit, transaction list delete (event delegation), theme toggle button, category add button, month select
    - Handle storage errors at init: show persistence-unavailable banner when storage unavailable, show save-failed messages on quota errors, show load-error message on corrupt data, fall back to defaults for categories when storage unavailable
    - _Requirements: 1.3, 2.4, 2.5, 3.2, 3.3, 4.2, 5.1, 5.2, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 7.2, 8.2, 8.3, 8.5, 8.6, 8.7, 11.3_

- [ ] 10. Implement CSS styling
  - [ ] 10.1 Implement CSS with theme variables, visual hierarchy, and contrast
    - Define CSS custom properties for dark and light themes via `[data-theme="dark"]` and `[data-theme="light"]` selectors on `:root`
    - Implement visual hierarchy with at least 3 distinct levels: page title (largest), section headings (medium), and body content (smallest, minimum 16px)
    - Ensure all body text renders at a minimum font size of 16px
    - Ensure text contrast ratio of at least 4.5:1 against backgrounds in both themes
    - Style scrollable transaction list with overflow
    - Style input form, category selector, chart canvas area, summary view, and message banners
    - _Requirements: 6.2, 10.1, 10.2, 10.3_

- [ ] 11. Checkpoint - Ensure all tests pass and UI renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Write integration tests
  - [ ]\* 12.1 Write integration tests for transaction CRUD flows
    - Load app in jsdom, simulate adding a transaction via the form, and assert list, balance, and chart update
    - Simulate deleting a transaction and assert list, balance, and chart update
    - Assert empty-state messages appear when no transactions exist for list, chart, and summary
    - _Requirements: 1.3, 2.4, 2.6, 3.2, 3.3, 4.2, 4.3_
  - [ ]\* 12.2 Write integration tests for storage error scenarios
    - Simulate `localStorage` unavailable and assert app runs in-memory with persistence-unavailable message
    - Simulate quota-exceeded throw from `setItem` and assert in-memory data is retained
    - Simulate corrupt stored JSON and assert app initializes empty with load-error message
    - _Requirements: 5.4, 5.5, 8.7, 11.3_
  - [ ]\* 12.3 Write integration tests for theme and category flows
    - Simulate theme toggle and assert `data-theme` attribute changes and persists across reload
    - Simulate adding a valid custom category and assert selector updates and persists
    - Test category validation rejections: empty name, name exceeding 50 characters, duplicate name, and limit reached at 20 custom categories
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 8.1, 8.2, 8.3, 8.5, 8.6_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at natural breakpoints
- Property-based tests validate universal correctness properties using fast-check with a minimum of 100 iterations each; each test is tagged with a comment referencing its design property
- Unit tests validate specific examples and edge cases (storage errors, rendering completeness)
- Integration tests validate end-to-end flows in a jsdom environment
- All production code goes in `js/app.js` (single file per Req 10.4), `css/styles.css` (single file per Req 10.3), and `index.html`
- Pure functions are exported as ES module exports for testability with Vitest
- The `AppController` (task 9.1) is the final wiring step that integrates all prior components with no orphaned code

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "10.1"] },
    { "id": 1, "tasks": ["3.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["4.1", "3.2", "3.3", "3.4"] },
    {
      "id": 3,
      "tasks": ["6.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8"]
    },
    { "id": 4, "tasks": ["7.1", "6.2"] },
    { "id": 5, "tasks": ["7.3", "7.2"] },
    { "id": 6, "tasks": ["9.1"] },
    { "id": 7, "tasks": ["12.1", "12.2", "12.3"] }
  ]
}
```
