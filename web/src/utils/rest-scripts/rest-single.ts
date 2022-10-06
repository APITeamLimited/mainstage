export const restSingle = {
  name: 'rest-single.js',
  language: 'javascript',
  builtIn: true,
  description: 'Default script for REST requests, sends a single request',
  script: `import http from 'k6/http';
import { mark } from 'apiteam';

// Get the request object
import { finalRequest } from 'apiteam/context';

export const options = {
    executionMode: 'rest_single',
};

export default function() {
    const res = http.request(...Object.values(finalRequest));

    // Create a marker to see the response in the Collection Editor
    mark("RESTResult", res);
}
`,
}
