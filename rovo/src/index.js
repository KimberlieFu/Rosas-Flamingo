import api, { route } from '@forge/api';

/* Fetch stale issues for a specific Jira project */
export const getStaleIssues = async (payload) => {
  const projectKey = payload.projectKey || payload.context?.jira?.projectKey || null;

  const jql = `project=${projectKey}`;
  const response = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jql}`);
  const data = await response.json();
  const staleIssues = await extractStaleIssues(data);
  return staleIssues;
};

/* Add two weeks of millis to `timestamp` */
export const getTimeStampInTwoWeeks = async (timestamp) => {
  // days * hrs * mins * sec * millis
  return timestamp + (14 * 24 * 60 * 60 * 1000);
};

/* Extract issue details from the data retrieved from jql query */
export const extractStaleIssues = async (data) => {
  let currentTimestamp = new Date().getTime();
  let staleIssues = [];

  for (const issue of data.issues) {
    // skip Epics and issues that are Done
    if (issue.fields.status.statusCategory.name === 'Done' ||
        issue.fields.issuetype.name === 'Epic') {
        continue;
    }

    let issueTimestamp = new Date(issue.fields.statuscategorychangedate).getTime();
    let issueTimestampInTwoWeeks = await getTimeStampInTwoWeeks(issueTimestamp);
    if (currentTimestamp > issueTimestampInTwoWeeks) {
      // check if last time status has been changed is greater than 2 weeks
      staleIssues.push(issue);
    }
  }

  let output = staleIssues.map(issue => ({
    issue_key: issue.key,
    title: issue.fields.summary,
    last_status_changed_date: (new Date(issue.fields.statuscategorychangedate)).toDateString(),
  }));

  return output;
};


export const listCompletedTasks = async (payload) => {
    const projectKey = payload.projectKey;
    const timeRange = payload.timeRange || '14d' // default within 14 days
    const jiraDomain = payload.domain || null

    if (!projectKey) {
        throw new Error('Project key required');
    }
    if (!jiraDomain) {
        throw new Error('Cannot get current domain')
    }

    const jql = `project = ${projectKey} AND status = Done AND assignee = currentUser() AND created >= -${timeRange} ORDER BY created DESC`;
    const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=${jql}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

    const projectData = await response.json();

    // console.log('Payload', payload)
    // console.log(`jql: ${jql}, Response: ${response.status} ${response.statusText}`);
    // console.log(projectData);

    const issues = projectData.issues;

    const issueLinks = {};
    for (const issue of issues) {
        const issueLink = `${jiraDomain}/browse/${issue.key}`;
        issueLinks[issue.key] = issueLink;
    }

    return {issues, issueLinks}
};

export const getIssues = async (payload) => {
  console.log(`Payload: ${JSON.stringify(payload)}`);

  const projectKey = payload.projectKey || payload.context?.jira?.projectKey || null;

  console.log(projectKey);

  if (!projectKey) {
      throw new Error("Project Key is required");
  }

  console.log(`Fetching issues for project: ${projectKey}`);

  const jql = `project=${projectKey} 
          AND status="In Progress" 
          AND assignee=currentUser()
          AND status changed to "In Progress" before -2w`;
  const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=${jql}`);
  const data = await response.json();

  // console.log(data);
  
  return extractIssueDetails(data);
}


export const extractIssueDetails = (data) => {
  return data.issues.map(issue => ({
      key: issue.key,
      summary: issue.fields.summary,
  }));
}
export async function fetchUserTickets(payload) {
  // Ensure both projectKey and domain are provided
  if (!payload || !payload.projectKey || !payload.domain) {
    console.error("Received payload:", payload);
    throw new Error("Both project key and domain are required.");
  }

  const projectKeyStr = payload.projectKey;
  const jiraDomain = payload.domain; // Retrieve the domain from the payload

  const jql = `project = "${projectKeyStr}" AND assignee = currentUser() AND (status = "To Do" OR status = "In Progress") ORDER BY created DESC`;
  console.log(`JQL: ${jql}`);

  try {
    const response = await api.asUser().requestJira(
      route`/rest/api/3/search?jql=${jql}`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`Error fetching tickets: ${response.status} ${response.statusText}`);
      console.error("Response body:", await response.text());
      throw new Error("Failed to fetch user tickets.");
    }

    const data = await response.json();
    const issues = data.issues || [];

    const formattedResponse = issues.map(issue => {
      const issueLink = `${jiraDomain}/browse/${issue.key}`;
      const status = issue.fields.status.name;
      const priority = issue.fields.priority ? issue.fields.priority.name : "No Priority";
      const created = new Date(issue.fields.created).toLocaleString();
      const updated = new Date(issue.fields.updated).toLocaleString();
      // If needed, include dueDate in the formatting (currently not outputting)
      // const dueDate = issue.fields.due ? new Date(issue.fields.due).toLocaleString() : "No Due Date";

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
