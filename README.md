# StandUpFlow - Your Jira Standup Assistant

This Forge app—**StandUpFlow**—is a Jira global page app designed to streamline daily standup meetings. Built as a Rovo Agent, StandUpFlow provides engineering teams with a structured overview of tasks, progress, and blockers, helping managers and team members stay aligned. Its key functionalities include:

- **Task Summary & Prioritization:**  
  Lists tasks assigned to a user (using fuzzy matching for partial names), sorts them by priority and due date, and flags overdue tasks.

- **Yesterday’s Progress:**  
  Retrieves completed tasks from the last working day, summarizing key details such as issue key, summary, and links.

- **Today’s Focus:**  
  Displays tasks planned for today based on status and due dates, ensuring a clear work agenda.

- **Blockers & Stale Issues:**  
  Identifies issues that have not had a status change for more than 2 weeks and flags blockers reported by users, making them easy to address.

- **Team Progress Overview:**  
  Provides a structured team-wide summary, displaying completed tasks, ongoing work, and outstanding blockers.

---

## Agent Details

- **Agent Name:**Standup Prep Agent
- **Description:** An intelligent Jira assistant dedicated to improving daily standup efficiency by tracking task progress, highlighting blockers, and providing a team-wide overview.  
- **Platform:** Jira Global Page  
- **App Installed at:** [standupflow.atlassian.net](https://standupflow.atlassian.net/wiki/home)  

---

## Manifest Overview

The app’s manifest defines a single Rovo Agent with multiple actions:

- **get-standup-summary:** Retrieves a summary of completed tasks, ongoing work, and blockers for standups.
- **get-task-priorities:** Retrieves tasks for a specified user, sorts them by priority and due date, and returns a Markdown table with task details.
- **list-completed-tasks:** Lists completed tasks from the previous working day and formats them as bullet points with issue links.
- **fetch-blockers:** Identifies and lists blockers reported by users or flagged issues in Jira.
- **get-stale-issues:** Fetches stale issues with no status change for more than 2 weeks and presents them in a table.
- **get-issues, fetch-user-tickets, display-tasks:** Additional actions for retrieving and displaying Jira issues relevant to standups.

For a full view, please see the [manifest.yml](./manifest.yml) file in the project.

---

## Running the Code

1. **Install Dependencies:**  
   From the project root directory, run:
   ```bash
   npm install
   ```

2. **Navigate to Your Project Directory:**  
   Open your terminal and change into the `rovo` directory:
   ```bash
   cd /path/to/your/rovo
   ```

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
   ```

6. **Deploy Your Forge App:**  
   Deploy your app to the default development environment:
   ```bash
   forge deploy
   ```

7. **Install Your App on Your Instance:**  
   Install the deployed app on your target Atlassian instance:
   ```bash
   forge install
   ```
   When prompted, enter the URL for your instance (e.g., https://standupflow.atlassian.net/wiki/home).

