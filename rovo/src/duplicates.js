// src/duplicates.js
import api, { route } from '@forge/api';

/**
 * checkDuplicates:
 * Fetches recent Jira tickets for a given project and compares ticket summaries to identify duplicates.
 *
 * @param {object} payload - The action payload.
 * @param {string} payload.projectKey - The Jira project key.
 * @returns {string} - A table formatted string with duplicate ticket pairs or a message if no duplicates are found.
 */
export async function checkDuplicates(payload) {
  const { projectKey } = payload;
  const jql = `project=${projectKey} ORDER BY created DESC`;
  
  let data;
  try {
    const response = await api.asApp().requestJira(
        route`/rest/api/3/search?jql=${jql}`
      );
      
    if (!response.ok) {
      throw new Error(`Failed to fetch tickets: ${response.status} ${response.statusText}`);
    }
    data = await response.json();
  } catch (error) {
    console.error(error);
    return `Error fetching tickets for project ${projectKey}: ${error.message}`;
  }
  
  if (!data.issues || data.issues.length === 0) {
    return `No tickets found for project ${projectKey}.`;
  }

  const issues = data.issues;
  let duplicates = [];

  for (let i = 0; i < issues.length; i++) {
    for (let j = i + 1; j < issues.length; j++) {
      const summary1 = issues[i].fields.summary;
      const summary2 = issues[j].fields.summary;
      const similarity = computeSimilarity(summary1, summary2);
      if (similarity >= 0.6) { // Threshold set to 60%
        duplicates.push({
          ticket1: issues[i].key,
          ticket2: issues[j].key,
          similarity: similarity.toFixed(2)
        });
      }
    }
  }

  if (duplicates.length === 0) {
    return `No duplicate tickets found in project ${projectKey}.`;
  }

  // Format results as a Markdown table.
  let output = "Duplicate Tickets:\n";
  output += "| Ticket 1 | Ticket 2 | Similarity Score |\n";
  output += "|----------|----------|------------------|\n";
  duplicates.forEach(pair => {
    output += `| ${pair.ticket1} | ${pair.ticket2} | ${pair.similarity} |\n`;
  });

  return output;
}

/**
 * computeSimilarity:
 * Computes a basic similarity score between two texts using word intersection over union.
 *
 * @param {string} text1 - The first text.
 * @param {string} text2 - The second text.
 * @returns {number} - A similarity score between 0 and 1.
 */
function computeSimilarity(text1, text2) {
  const words1 = text1.toLowerCase().split(/\W+/).filter(Boolean);
  const words2 = text2.toLowerCase().split(/\W+/).filter(Boolean);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(word => set2.has(word)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}
