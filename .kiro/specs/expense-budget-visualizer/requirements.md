# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to record expenses, track their total balance, and visualize spending distribution by category. The application runs entirely in the browser using HTML, CSS, and Vanilla JavaScript with no backend server. All data is persisted locally through the browser Local Storage API. The application provides a clean, minimal interface with a scrollable transaction list, an input form, a total balance display, a pie chart, dark/light theme switching, a monthly summary view, and support for custom categories.

## Glossary

- **Expense_Budget_Visualizer**: The client-side web application described by this document
- **Transaction**: A single expense entry containing an item name, an amount, and a category
- **Category**: A classification label applied to a Transaction (default options: Food, Transport, Fun)
- **Balance**: The net total computed from all recorded Transactions
- **Local_Storage**: The browser Web Storage API used to persist data client-side between sessions
- **Theme**: The visual display mode of the application, either dark or light
- **Summary**: A monthly aggregation of Transactions showing total amount and category breakdown
- **Input_Form**: The UI component for entering a new Transaction
- **Transaction_List**: The UI component that displays all recorded Transactions in a scrollable list
- **Balance_Display**: The UI component that shows the total Balance at the top of the interface
- **Chart_Renderer**: The UI component that renders the pie chart of spending by category
- **Storage_Manager**: The component responsible for reading and writing data to Local_Storage
- **Theme_Manager**: The component responsible for switching and persisting the Theme
- **Summary_View**: The UI component that displays the monthly Summary
- **Category_Manager**: The component responsible for adding and persisting custom Categories
- **Modern_Browser**: A current version of Chrome, Firefox, Edge, or Safari

## Requirements

### Requirement 1: Add Transactions via Input Form

**User Story:** As a user, I want to add my expenses through a form, so that I can record my spending.

#### Acceptance Criteria

1. THE Input_Form SHALL display fields for item name, amount, and category.
2. THE Input_Form SHALL provide a category selector containing the default options Food, Transport, and Fun, and any custom categories previously added by the user.
3. WHEN a user submits a completed form, THE Input_Form SHALL add a new Transaction to the Transaction_List.
4. IF a user submits a form with one or more empty or whitespace-only fields, THEN THE Input_Form SHALL display a validation message indicating the required fields and shall not add a Transaction.
5. IF a user submits a form with an amount that is non-numeric, zero, or negative, THEN THE Input_Form SHALL display a validation message indicating that the amount must be a positive number and shall not add a Transaction.

### Requirement 2: View and Manage Transaction List

**User Story:** As a user, I want to view and delete my recorded expenses, so that I can manage my spending history.

#### Acceptance Criteria

1. THE Transaction_List SHALL display all recorded Transactions in a scrollable list.
2. THE Transaction_List SHALL display the item name, amount, and category for each Transaction.
3. THE Transaction_List SHALL display a delete control for each Transaction.
4. WHEN a user activates the delete control for a Transaction, THE Transaction_List SHALL remove the Transaction from the list.
5. WHEN a user activates the delete control for a Transaction, THE Storage_Manager SHALL update Local_Storage to reflect the removal.
6. IF no Transactions are recorded, THEN THE Transaction_List SHALL display a message indicating that no Transactions are available.

### Requirement 3: Display Total Balance

**User Story:** As a user, I want to see my total balance, so that I can track my overall spending.

#### Acceptance Criteria

1. THE Balance_Display SHALL display the total Balance at the top of the interface.
2. WHEN a Transaction is added, THE Balance_Display SHALL update the total Balance to reflect the new net total within 1 second.
3. WHEN a Transaction is deleted, THE Balance_Display SHALL update the total Balance to reflect the new net total within 1 second.
4. IF no Transactions are recorded, THEN THE Balance_Display SHALL display a total Balance of zero.

### Requirement 4: Visualize Spending by Category

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand my spending distribution.

#### Acceptance Criteria

1. THE Chart_Renderer SHALL display a pie chart where each spending category maps to one distinct slice, and the slice size is proportional to the total spending amount in that category.
2. WHEN a Transaction is added, modified, or deleted, THE Chart_Renderer SHALL update the pie chart automatically without requiring a manual page reload.
3. WHILE no Transactions exist, THE Chart_Renderer SHALL display a message indicating no spending data is available instead of rendering a pie chart.

### Requirement 5: Persist Data Using Local Storage

**User Story:** As a user, I want my data saved in my browser, so that my expenses persist between sessions without a backend server.

#### Acceptance Criteria

1. THE Storage_Manager SHALL store all current Transactions from the Transaction_List in the browser Local_Storage API.
2. WHEN the application loads, THE Storage_Manager SHALL retrieve stored Transactions from Local_Storage and populate the Transaction_List.
3. THE Storage_Manager SHALL store all data client-side without transmitting data to an external server.
4. IF Local_Storage is unavailable or quota is exceeded when writing, THEN THE Storage_Manager SHALL retain current Transactions in memory and display a message indicating the data could not be saved.
5. IF stored data is invalid or corrupt when the application loads, THEN THE Storage_Manager SHALL initialize an empty Transaction_List and display a message indicating the stored data could not be loaded.

### Requirement 6: Toggle Dark and Light Theme

**User Story:** As a user, I want to switch between dark and light mode, so that I can use the application comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Theme_Manager SHALL provide a toggle to switch between dark and light Theme and indicate the currently active Theme.
2. WHEN a user toggles the Theme, THE Theme_Manager SHALL apply the selected Theme to the entire interface.
3. THE Theme_Manager SHALL persist the selected Theme in Local_Storage between sessions.
4. WHEN the application loads, THE Theme_Manager SHALL apply the Theme stored in Local_Storage.
5. IF no Theme is stored in Local_Storage on first load, THEN THE Theme_Manager SHALL apply the light Theme as the default.

### Requirement 7: View Monthly Summary

**User Story:** As a user, I want a monthly summary of my spending, so that I can review my expenses over time.

#### Acceptance Criteria

1. THE Summary_View SHALL display a monthly aggregation of Transactions grouped by month, showing the total amount of all Transactions for each month.
2. WHEN a user selects a month, THE Summary_View SHALL display the total amount of all Transactions for that month and a category breakdown showing the total amount per Category for that month.
3. THE Summary_View SHALL include only months that contain at least one Transaction.
4. IF no Transactions exist, THEN THE Summary_View SHALL display a message indicating that no Transactions are available.

### Requirement 8: Add Custom Categories

**User Story:** As a user, I want to add custom categories, so that I can classify expenses beyond the default options.

#### Acceptance Criteria

1. THE Category_Manager SHALL allow users to add up to 20 custom Categories, each with a name of 1 to 50 characters that is not empty, not whitespace-only, and does not duplicate an existing default or custom Category name.
2. WHEN a user adds a custom Category with a valid name, THE Category_Manager SHALL add the Category to the Input_Form category selector.
3. WHEN a user successfully adds a custom Category, THE Category_Manager SHALL persist the current list of custom Categories in Local_Storage.
4. WHEN the application loads, THE Category_Manager SHALL load custom Categories from Local_Storage into the category selector.
5. IF a user submits a custom Category name that is empty, exceeds 50 characters, or duplicates an existing Category name, THEN THE Category_Manager SHALL reject the submission and display an error message indicating the reason without modifying the category selector.
6. IF the number of custom Categories reaches 20, THEN THE Category_Manager SHALL reject new custom Category additions and display an error message indicating the limit has been reached.
7. IF Local_Storage is unavailable when the application loads, THEN THE Category_Manager SHALL load only default Categories into the category selector and display an error message indicating custom Categories could not be loaded.

### Requirement 9: Application Performance

**User Story:** As a user, I want the application to respond quickly, so that I can manage expenses without lag.

#### Acceptance Criteria

1. WHEN a user performs an input action on an interface element, THE Expense_Budget_Visualizer SHALL visually reflect the resulting change in the affected display elements within 200 milliseconds measured from the completion of the input action.
2. WHERE a Modern_Browser is used, THE Expense_Budget_Visualizer SHALL render the initial interface with all elements in an interactive state within 2 seconds of the initial page request.
3. WHILE more than 100 expense entries are displayed, WHEN a user performs an input action, THE Expense_Budget_Visualizer SHALL update the affected display elements within 500 milliseconds measured from the completion of the input action.

### Requirement 10: Application Design and Usability

**User Story:** As a user, I want a clean and readable interface, so that I can use the application without confusion.

#### Acceptance Criteria

1. THE Expense_Budget_Visualizer SHALL present a visual hierarchy with at least 3 distinct levels—a page title, section headings, and body content—where each level uses a progressively larger text size, with headings rendered larger than body text.
2. THE Expense_Budget_Visualizer SHALL render all body text at a minimum font size of 16 pixels and with a contrast ratio of at least 4.5:1 against its background across all interface sections.
3. THE Expense_Budget_Visualizer SHALL contain exactly one CSS file within the css/ directory.
4. THE Expense_Budget_Visualizer SHALL contain exactly one JavaScript file within the js/ directory.

### Requirement 11: Browser Compatibility

**User Story:** As a user, I want the application to work in my preferred browser, so that I can use it without changing browsers.

#### Acceptance Criteria

1. WHEN the Expense_Budget_Visualizer is opened in a Modern_Browser, THE Expense_Budget_Visualizer SHALL render all user interface elements and respond to user interactions without errors.
2. THE Expense_Budget_Visualizer SHALL operate as a standalone web application that loads and stores all data using Local Storage without making network requests to a backend server.
3. IF the browser does not support or has disabled Local Storage, THEN THE Expense_Budget_Visualizer SHALL display an error message indicating that data persistence is unavailable.
