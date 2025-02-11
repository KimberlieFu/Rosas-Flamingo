import api, { route } from '@forge/api'

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
}
