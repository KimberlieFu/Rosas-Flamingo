import api, { route } from '@forge/api';

/**
 * getStaleIssues:
 * Fetches issues for a specific Jira project and filters out the issues that have not changed status for over 2 weeks.
 *
 * @param {object} payload - The action payload.
 * @param {string} payload.projectKey - The Jira project key.
 * @returns {Array} An array of objects representing stale issues with their key, title, and last status change date.
 */
export const getStaleIssues = async (payload) => {
  // Retrieve the project key either from payload or from the Jira context
  const projectKey = payload.projectKey || payload.context?.jira?.projectKey || null;

  // Build a simple JQL query to fetch all issues from the project
  const jql = `project=${projectKey}`;
  // Send a request as the app (using app permissions) to fetch issues from Jira
  const response = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jql}`);
  // Parse the JSON response
  const data = await response.json();
  // Filter and extract stale issues from the fetched data
  const staleIssues = await extractStaleIssues(data);
  return staleIssues;
};

/**
 * getTimeStampInTwoWeeks:
 * Adds two weeks (in milliseconds) to a given timestamp.
 *
 * @param {number} timestamp - The original timestamp in milliseconds.
 * @returns {number} The timestamp plus 14 days worth of milliseconds.
 */
export const getTimeStampInTwoWeeks = async (timestamp) => {
  // Calculate two weeks in milliseconds: 14 days * 24 hrs * 60 mins * 60 sec * 1000 ms
  return timestamp + (14 * 24 * 60 * 60 * 1000);
};

/**
 * extractStaleIssues:
 * Iterates over the issues returned from a JQL query and identifies those that haven't had a status change for more than 2 weeks.
 *
 * @param {object} data - The data object returned from the Jira API.
 * @returns {Array} An array of objects containing the issue key, title, and last status change date for stale issues.
 */
export const extractStaleIssues = async (data) => {
  // Get the current time in milliseconds
  let currentTimestamp = new Date().getTime();
  let staleIssues = [];

  // Iterate through each issue in the response
  for (const issue of data.issues) {
    // Skip issues that are either completed (Done) or are Epics
    if (
      issue.fields.status.statusCategory.name === 'Done' ||
      issue.fields.issuetype.name === 'Epic'
    ) {
      continue;
    }

    // Get the timestamp when the issue's status category was last changed
    let issueTimestamp = new Date(issue.fields.statuscategorychangedate).getTime();
    // Calculate the timestamp two weeks after the issue's last status change
    let issueTimestampInTwoWeeks = await getTimeStampInTwoWeeks(issueTimestamp);
    // If the current time is greater than the two-weeks timestamp, consider the issue stale
    if (currentTimestamp > issueTimestampInTwoWeeks) {
      staleIssues.push(issue);
    }
  }

  // Map the stale issues to a simpler output format
  let output = staleIssues.map(issue => ({
    issue_key: issue.key,
    title: issue.fields.summary,
    last_status_changed_date: (new Date(issue.fields.statuscategorychangedate)).toDateString(),
  }));

  return output;
};

/**
 * listCompletedTasks:
 * Fetches tasks marked as "Done" for the current user within a specified time range.
 *
 * @param {object} payload - The action payload.
 * @param {string} payload.projectKey - The Jira project key.
 * @param {string} [payload.timeRange] - The time range (default '14d').
 * @param {string} payload.domain - The website domain (e.g., your-domain.atlassian.net).
 * @returns {object} An object containing the issues and a mapping of issue keys to their corresponding Jira links.
 */
export const listCompletedTasks = async (payload) => {
  // Retrieve required inputs from payload
  const projectKey = payload.projectKey;
  const timeRange = payload.timeRange || '14d'; // Default to tasks within 14 days
  const jiraDomain = payload.domain || null;

  // Validate required inputs
  if (!projectKey) {
    throw new Error('Project key required');
  }
  if (!jiraDomain) {
    throw new Error('Cannot get current domain');
  }

  // Build the JQL query for completed tasks
  const jql = `project = ${projectKey} AND status = Done AND assignee = currentUser() AND created >= -${timeRange} ORDER BY created DESC`;
  
  // Send a request as the user (using user permissions) to fetch tasks
  const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=${jql}`, {
    headers: {
      'Accept': 'application/json'
    }
  });

  // Parse the JSON response
  const projectData = await response.json();
  const issues = projectData.issues;

  // Create a mapping for each issue key to its Jira URL
  const issueLinks = {};
  for (const issue of issues) {
    const issueLink = `${jiraDomain}/browse/${issue.key}`;
    issueLinks[issue.key] = issueLink;
  }

  return { issues, issueLinks };
};

/**
 * getIssues:
 * Fetches issues that are "In Progress" and assigned to the current user,
 * specifically those that have been in progress for more than 2 weeks.
 *
 * @param {object} payload - The action payload.
 * @param {string} [payload.projectKey] - The Jira project key, or obtained from context.
 * @returns {Array} An array of simplified issue objects containing the issue key and summary.
 */
export const getIssues = async (payload) => {
  // Retrieve the project key either from payload or from the Jira context
  const projectKey = payload.projectKey || payload.context?.jira?.projectKey || null;

  // If project key is not provided, throw an error
  if (!projectKey) {
    throw new Error("Project Key is required");
  }

  // Build the JQL query to fetch issues that are in progress and have been so for over 2 weeks
  const jql = `project=${projectKey} 
          AND status="In Progress" 
          AND assignee=currentUser()
          AND status changed to "In Progress" before -2w`;
  // Send a request as the user to fetch issues
  const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=${jql}`);
  const data = await response.json();

  // Extract and return simplified issue details
  return extractIssueDetails(data);
};

/**
 * extractIssueDetails:
 * Simplifies the raw Jira API data by extracting only key information (issue key and summary).
 *
 * @param {object} data - The raw data returned from the Jira API.
 * @returns {Array} An array of objects with each object containing the issue key and summary.
 */
export const extractIssueDetails = (data) => {
  return data.issues.map(issue => ({
    key: issue.key,
    summary: issue.fields.summary,
  }));
};

/**
 * fetchUserTickets:
 * Retrieves all tickets assigned to the current user from a given project,
 * and formats them into a Markdown string.
 *
 * @param {object} payload - The action payload.
 * @param {string} payload.projectKey - The Jira project key.
 * @param {string} payload.domain - The website domain (e.g., your-domain.atlassian.net).
 * @returns {string} A Markdown-formatted string with details for each ticket.
 */
export async function fetchUserTickets(payload) {
  // Validate that both projectKey and domain are provided
  if (!payload || !payload.projectKey || !payload.domain) {
    console.error("Received payload:", payload);
    throw new Error("Both project key and domain are required.");
  }

  const projectKeyStr = payload.projectKey;
  // Retrieve the domain from the payload to build issue links
  const jiraDomain = payload.domain;

  // Build the JQL query to fetch tickets assigned to the current user
  const jql = `project = "${projectKeyStr}" AND assignee = currentUser() AND (status = "To Do" OR status = "In Progress") ORDER BY created DESC`;

  try {
    // Send a request as the user to fetch tickets
    const response = await api.asUser().requestJira(
      route`/rest/api/3/search?jql=${jql}`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );

    // Check if the response was successful
    if (!response.ok) {
      console.error(`Error fetching tickets: ${response.status} ${response.statusText}`);
      console.error("Response body:", await response.text());
      throw new Error("Failed to fetch user tickets.");
    }

    const data = await response.json();
    const issues = data.issues || [];

    // Format each issue into a Markdown-formatted string
    const formattedResponse = issues.map(issue => {
      const issueLink = `${jiraDomain}/browse/${issue.key}`;
      const status = issue.fields.status.name;
      const priority = issue.fields.priority ? issue.fields.priority.name : "No Priority";
      const created = new Date(issue.fields.created).toLocaleString();
      const updated = new Date(issue.fields.updated).toLocaleString();

      return `
1. **Issue Link**: [${issueLink}](${issueLink})
   - **Status**: ${status}
   - **Priority**: ${priority}
   - **Created**: ${created}
   - **Updated**: ${updated}
      `;
    });

    return formattedResponse.join("\n\n");

  } catch (error) {
    console.error("Error in fetchUserTickets function:", error);
    throw new Error("An unexpected error occurred while fetching tickets.");
  }
}

/**
 * displayTasks:
 * Returns a formatted string that lists all the available tasks along with instructions on what details to provide.
 *
 * @returns {string} A message listing the available tasks and instructions.
 */
 export async function displayTasks() {
  try {
    // If any retrieval of dynamic data fails, we catch the error and return our static instructions.
    const message = `Here are the tasks you can ask me to do:

1. **Analyze Jira Issues in this project**
   - *Description:* Analyze issues assigned to you.
   - *What to Provide:* A project key and any additional instructions for the analysis.

2. **List my tasks sorted by due date**
   - *Description:* Retrieve tasks sorted by their due dates.
   - *What to Provide:* Your Jira username (assignee) and the project key.

3. **Find stale issues in projects**
   - *Description:* Identify issues that have not had a status change for more than 2 weeks.
   - *What to Provide:* The project key.

4. **List completed tasks**
   - *Description:* List tasks marked as done within a specified time range.
   - *What to Provide:* The project key, the website domain (e.g., your-domain.atlassian.net), and an optional time range (e.g., '5d', '4w 2d').

5. **Fetch tickets assigned to me**
   - *Description:* Retrieve all tickets assigned to you.
   - *What to Provide:* The project key and the website domain.

6. **Check duplicate tickets**
   - *Description:* Check for duplicate tickets by comparing summaries.
   - *What to Provide:* The project key.

Please type one of these commands along with the necessary details to proceed.`;
    
    return message;
  } catch (error) {
    // If there's any error, return a fallback message with the list of tasks.
    console.error("Error in displayTasks:", error);
    return `Sorry, I encountered an error retrieving the available tasks.
    
However, here are the tasks I can help with:
- Analyze Jira issues in this project (provide project key and instructions)
- List tasks sorted by due date (provide assignee and project key)
- Find stale issues (provide project key)
- List completed tasks (provide project key, domain, and optionally a time range)
- Fetch tickets assigned to you (provide project key and domain)
- Check duplicate tickets (provide project key)

Please provide the necessary details for the task you want to proceed with.`;
  }
}
