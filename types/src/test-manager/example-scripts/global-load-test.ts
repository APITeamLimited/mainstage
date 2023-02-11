export const globalLoadTest = {
  name: 'global-load-test.js',
  prettyName: 'Global Load Test',
  language: 'javascript',
  builtIn: true,
  description: 'Runs a globally distributed load test',
  script: `// Runs a globally distributed load test

import { lifecycle } from 'apiteam/context'
import http from 'apiteam/http'

export const options = {
  executionMode: 'httpMultiple',
  loadDistribution: [
    {
      location: 'global',
      fraction: 100,
    },
  ],
  stages: [
    { target: 500, duration: '1m' },
    { target: 500, duration: '8m' },
    { target: 0, duration: '1m' },
  ],
  outputConfig: {
    graphs: [
      {
        name: 'Overview',
        description: '',
        series: [
          {
            loadZone: 'global',
            metric: 'vus',
            kind: 'area',
            color: '#808080',
          },
          {
            loadZone: 'global',
            metric: 'http_reqs',
            kind: 'line',
            color: '#0096FF',
          },
          {
            loadZone: 'global',
            metric: 'http_req_duration',
            kind: 'line',
            color: '#FF00FF',
          },
          {
            loadZone: 'global',
            metric: 'http_req_failed',
            kind: 'line',
            color: '#FF0000',
          },
        ],
        desiredWidth: 3,
      },
      {
        name: 'Request Duration',
        description:
          'Request duration compared in different load zones over time',
        desiredWidth: 2,
        series: [
          {
            loadZone: 'global',
            color: '#00ff00',
            kind: 'line',
            metric: 'http_req_duration',
          },
          {
            loadZone: 'europe-west2',
            color: '#ff0000',
            kind: 'line',
            metric: 'http_req_duration',
          },
          {
            loadZone: 'us-west2',
            color: '#0000ff',
            kind: 'line',
            metric: 'http_req_duration',
          },
        ],
      },
    ],
  },
}

export default () => {
  const node = lifecycle.node()

  // Recursively execute all child nodes
  if (node.variant === 'httpRequest') {
    const { method, url, body, params } = node.finalRequest
    http.request(method, url, body, params)
  } else if (node.variant === 'standaloneScript') {
    node.scripts['standalone.js']['default'].call()
  } else if (node.variant === 'group') {
    node.children.forEach((childNode) => {
      childNode.scripts['global-load-test.js']['default'].call()
    })
  }
}
`,
}
