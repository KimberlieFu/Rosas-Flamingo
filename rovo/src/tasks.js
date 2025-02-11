import api, { route, storage } from '@forge/api';

/**
 * getTaskPriorities:
 * Fetches Jira tasks assigned to a specified user that are either in "To Do" or "Done" statuses,
 * sorts them by due date, and returns a Markdown-formatted table.
 * It uses fuzzy matching to determine the correct assignee based on a partial input.
 *
 * @param {object} payload - The action payload.
 * @param {string} payload.assignee - A partial or full assignee name.
 * @param {string} payload.projectKey - The Jira project key.
 * @returns {string} - A Markdown table with task details or an error/clarification message.
 */
export async function getTaskPriorities(payload) {
  let { assignee, projectKey } = payload;
    
  // Get matching assignees using fuzzy matching
  const matches = await getMatchingAssignees(projectKey, assignee);
  if (matches.length === 0) {
    return `No assignees found matching "${assignee}" in project ${projectKey}. Please try a different value.`;
  } else if (matches.length > 1) {
    let message = `Multiple assignees found matching "${assignee}" in project ${projectKey}:\n`;
    matches.forEach(a => {
      message += `- ${a.displayName})\n`;
    });
    message += "Please provide a more specific name.";
    return message;
  }
  
  // If exactly one match is found, use its accountId.
  const selectedAssignee = matches[0];  
  // Build the JQL query using the exact accountId.
  // For Jira Cloud, using accountId is more reliable.
  const jql = `assignee = "${selectedAssignee.accountId}" AND project = ${projectKey} AND status in ("To Do", "Done") ORDER BY duedate ASC`;
  
  const response = await api.asApp().requestJira(
    route`/rest/api/3/search?jql=${(jql)}&fields=summary,duedate,priority,status,timeoriginalestimate,labels`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  
  if (!data.issues || data.issues.length === 0) {
    return `No tasks found for assignee ${selectedAssignee.displayName} in project ${projectKey}.`;
  }
  
  const issues = data.issues;
  const today = new Date();
  let output = `### Task Priorities for ${selectedAssignee.displayName} in Project ${projectKey}\n`;
  output += "| Issue Key | Summary | Due Date | Priority | Status | Time Left | Labels |\n";
  output += "|-----------|---------|----------|----------|--------|-----------|--------|\n";
  
  issues.forEach(issue => {
    const key = issue.key;
    const summary = issue.fields.summary;
    
    // Process due date and calculate time left
    let dueDate = issue.fields.duedate ? new Date(issue.fields.duedate) : null;
    let dueDateStr = dueDate ? dueDate.toLocaleDateString() : "N/A";
    let timeLeft = "N/A";
    if (dueDate) {

      let diffMs = dueDate - today;
      if (diffMs > 0) {
        let hoursLeft = diffMs / (1000 * 60 * 60);
        if (hoursLeft >= 24) {
          let daysLeft = (hoursLeft / 24).toFixed(1);
          timeLeft = `${daysLeft} days`;
        } else {
          timeLeft = `${hoursLeft.toFixed(1)} hrs`;
        }
      } else {
        timeLeft = "Overdue";
      }
    }
    
    // Flag overdue tasks with an extra marker if dueDate is past.
    let overdueMarker = "";
    if (dueDate && dueDate < today) {
      overdueMarker = " ⚠️";
    }
    
    const priority = issue.fields.priority ? issue.fields.priority.name : "N/A";
    const status = issue.fields.status ? issue.fields.status.name : "N/A";
    const labels = issue.fields.labels && issue.fields.labels.length > 0 ? issue.fields.labels.join(", ") : "N/A";
    
    output += `| ${key} | ${summary} | ${dueDateStr}${overdueMarker} | ${priority} | ${status} | ${timeLeft} | ${labels} |\n`;
  });
  
  return output;
}

/**
 * getMatchingAssignees:
 * Fetches unique assignees for a given project and filters them by a partial match on displayName.
 *
 * @param {string} projectKey - The Jira project key.
 * @param {string} partialName - The partial name input provided by the user.
 * @returns {Promise<Array>} - An array of matching assignee objects.
 */
async function getMatchingAssignees(projectKey, partialName) {
  // Build a JQL query to fetch issues for the project
  const jql = `project = ${projectKey} ORDER BY created DESC`;
  
  const response = await api.asApp().requestJira(
    route`/rest/api/3/search?jql=${(jql)}&fields=assignee`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch issues for assignees: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  const uniqueAssignees = new Map();
  
  if (data.issues) {
    data.issues.forEach(issue => {
      const assignee = issue.fields.assignee;
      if (assignee && !uniqueAssignees.has(assignee.accountId)) {
        uniqueAssignees.set(assignee.accountId, assignee);
      }
    });
  }
  
  // Filter based on partialName (case insensitive substring match on displayName)
  const matches = [];
  uniqueAssignees.forEach(assignee => {
    if (assignee.displayName.toLowerCase().includes(partialName.toLowerCase())) {
      matches.push(assignee);
    }
  });
  
  return matches;
}

