export const requestSingle = {
  name: 'request-single.js',
  language: 'javascript',
  builtIn: true,
  description: 'Default script, sends a single request',
  script: `// Sends a single request and stores the response

import http from "k6/http";
import { lifecycle } from "apiteam/context";

export const options = {
    executionMode: "http_single",
};

export default function () {
    // Access the final request object from the collection editor
    const { method, url, body, params } = lifecycle.finalRequest;

    // Run the request
    const response = http.request(method, url, body, params);

    // Create a marker to see the response in the collection editor
    lifecycle.markResponse(response);
}
`,
}
