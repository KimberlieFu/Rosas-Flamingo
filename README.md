# Rosas-Flamingo

This Forge app—**Rosas-Flamingo**—is a Jira global page app that provides a comprehensive team management assistant. The app is built as a Rovo Agent and is designed to help engineering managers optimize productivity by performing various Jira issue analyses. Its key functionalities include:

- **Task Prioritization:**  
  Lists tasks assigned to a user (using fuzzy matching for partial names) sorted by due date, calculates the remaining time until due (in hours or days), and flags overdue tasks.

- **Duplicate Ticket Detection:**  
  Compares recent Jira tickets' summaries to flag potential duplicate issues based on a similarity threshold.

- **Stale Issue Detection:**  
  Identifies stale issues—tickets that have not had a status change for more than 2 weeks—and presents them in a structured table.

- **Completed Tasks Detection:**  
  Lists completed tasks (done within a specified time range, default 14 days) along with details such as issue key, summary, and issue link. If child issues exist, they are displayed as indented sub-bullets.

- **Additional Functionalities:**  
  The app also includes actions for fetching user tickets, displaying available tasks, and performing an overall analysis of Jira issues.

---

## Agent Details

- **Agent Name:** Methexis: Team Assistant  
- **Description:** An intelligent assistant dedicated to managing Jira tickets and supporting efficient team workflows by handling task prioritization, duplicate ticket detection, stale issue detection, and completed task listing.  
- **Platform:** Confluence Global Page  
- **App Installed at:** [rosas-flamingo.atlassian.net](https://rosas-flamingo.atlassian.net/wiki/home)

---

## Manifest Overview

The app’s manifest defines a single Rovo Agent with multiple actions:

- **check-duplicates:** Retrieves and analyzes Jira tickets to detect duplicates.  
- **get-task-priorities:** Retrieves tasks for a specified user, sorts them by due date, calculates time left (or flags them as overdue), and returns a Markdown table with task details.  
- **get-stale-issues:** Fetches stale issues (with no status change for more than 2 weeks) and formats the output as a table.  
- **list-completed-tasks:** Lists completed tasks within a provided time range (defaulting to 14 days) and displays them as bullet points with issue links.  
- **get-issues, fetch-user-tickets, display-tasks:** Additional actions for retrieving and displaying Jira issues.

For a full view, please see the [manifest.yml](./manifest.yml) file in the project.

---

## Running the Code

1. **Install Dependencies:**  
   From the project root directory, run:
   ```bash
   npm install

## Running the Code

2. **Navigate to Your Project Directory:**  
   Open your terminal and change into the `rovo` directory:
   ```bash
   cd /path/to/your/rovo

3. **Install Node.js Version 20 Using nvm:**
    Ensure you have nvm installed, then run:
    ```bash
    nvm install 20
    nvm use 20
    ```

4. **Log In to Forge:**
    Authenticate with your Atlassian account by running:

    ```bash
    forge login
    ```

5. **Install Project Dependencies:**
    Install the required npm packages:
    ```bash
    npm install

6. **Deploy Your Forge App:**
    Deploy your app to the default development environment:
    ```bash
    forge deploy

7. **Install Your App on Your Instance:**
    Install the deployed app on your target Atlassian instance:
    ```bash
    forge install
When prompted, enter the URL for your instance (e.g., https://rosas-flamingo.atlassian.net/wiki/home).

