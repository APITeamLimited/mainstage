export const loadTest = {
  name: 'load-test.js',
  prettyName: 'Load Test',
  language: 'javascript',
  builtIn: true,
  description: 'Runs a load test from a single location',
  script: `// Runs a load test from a single location

import { lifecycle } from "apiteam/context";
import http from "apiteam/http";

export const options = {
    executionMode: "httpMultiple",
    loadDistribution: [
        {
            location: "europe-west2",
            fraction: 100,
        },
    ],
    stages: [
        { target: 250, duration: "1m" },
        { target: 250, duration: "8m" },
        { target: 0, duration: "1m" },
    ],
    outputConfig: {
        graphs: [
            {
                name: "Overview",
                description: "",
                series: [
                    {
                        loadZone: "europe-west2",
                        metric: "vus",
                        kind: "area",
                        color: "#808080",
                    },
                    {
                        loadZone: "europe-west2",
                        metric: "http_reqs",
                        kind: "line",
                        color: "#0096FF",
                    },
                    {
                        loadZone: "europe-west2",
                        metric: "http_req_duration",
                        kind: "line",
                        color: "#FF00FF",
                    },
                    {
                        loadZone: "europe-west2",
                        metric: "http_req_failed",
                        kind: "line",
                        color: "#FF0000",
                    },
                ],
                desiredWidth: 3,
            },
        ],
    },
};

const executeNode = (node) => {
    if (node.variant === "httpRequest") {
        const { method, url, body, params } = node.finalRequest;
        http.request(method, url, body, params);
    } else if (node.variant === "group") {
        node.children.forEach(executeNode);
    } else {
        throw new Error("Unknown node variant");
    }
};

export default () => {
    const rootNode = lifecycle.node();

    executeNode(rootNode);
};
`,
}
