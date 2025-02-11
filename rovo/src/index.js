import api, { route } from "@forge/api";

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