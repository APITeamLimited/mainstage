export const requestSingle = {
  name: 'request-single.js',
  prettyName: 'Single Request',
  language: 'javascript',
  builtIn: true,
  description: 'Sends a single request and stores the response',
  script: `// Sends a single request and stores the response

import { lifecycle } from 'apiteam/context'
import http from 'apiteam/http'

export const options = {
  executionMode: 'httpSingle',
}

export default () => {
  // Access the final request object
  const {
    finalRequest: { method, url, body, params },
  } = lifecycle.node()

  // Run the request
  const response = http.request(method, url, body, params)

  // If the response has an error, throw an error to stop the test
  if (response.error) {
    throw new Error(response.error)
  }

  // Create a marker to see the response in the collection editor
  lifecycle.markResponse(response)
}
`,
}
