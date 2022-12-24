export const requestSingle = {
  name: 'request-single.js',
  language: 'javascript',
  builtIn: true,
  description: 'Default script on APITeam, sends a single request',
  script: `// Sends a single request and stores the response

import http from "apiteam/http";
import { lifecycle } from "apiteam/context";

export const options = {
    executionMode: "httpSingle",
};

export default function () {
    // Access the final request object from the collection editor
    const { method, url, body, params } = lifecycle.finalRequest;

    // Run the request
    const response = http.request(method, url, body, params);

    // If the response has an error, throw an error to stop the test
    if (response.error) {
      throw new Error(response.error)
    }

    // Create a marker to see the response in the collection editor
    lifecycle.markResponse(response);
}
`,
}
