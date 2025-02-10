import api, { route } from "@forge/api";

export const getIssues = async (payload) => {
    console.log(`Payload: ${JSON.stringify(payload)}`);

    const projectKey = payload.context?.jira?.projectKey || null;
    const label = payload.label || null;

    if (!projectKey) {
        throw new Error("Project Key is required");
    }

    console.log(`Fetching issues for project: ${projectKey} and label: ${label}`);

    const jql = label ? `project=${projectKey} AND labels=${label}` : `project=${projectKey}`;
    const response = await api.asUser().requestJira(route`/rest/api/3/search?jql=${jql}`);
    const data = await response.json();
    
    return extractIssueDetails(data);
}

export const extractIssueDetails = (data) => {
    return data.issues.map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
    }));
}