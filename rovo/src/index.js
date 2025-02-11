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
