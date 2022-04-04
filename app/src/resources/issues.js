import { apiRequest } from "../api/api-request";

const baseUrl = '/issues'

export async function getIssues(){
  return apiRequest(baseUrl)
}

export async function postIssue(issue){
  return apiRequest(baseUrl, {
    method: 'POST',
    body: JSON.stringify(issue)
  })
}

export async function editIssue(issue){
  return apiRequest(baseUrl, {
    method: 'PUT',
    body: JSON.stringify(issue)
  })
}

export async function deleteIssue(issueId){
  return apiRequest(`${baseUrl}/${issueId}`, { method: 'delete' })
}
