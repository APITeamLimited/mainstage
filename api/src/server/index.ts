#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import { apiCliOptions, apiServerHandler } from './cliHandlers'

export * from './types'

const positionalArgs = yargs(hideBin(process.argv)).parseSync()._

// "bin": {
//   "rw-api-server-watch": "./dist/watch.js",
//   "rw-log-formatter": "./dist/logFormatter/bin.js",
//   "rw-server": "./dist/index.js"
// },

if (require.main === module) {
  if (positionalArgs.includes('api') && !positionalArgs.includes('web')) {
    apiServerHandler(
      yargs(hideBin(process.argv)).options(apiCliOptions).parseSync()
    )
  } else {
    console.error('You must specify the api command')
  }
}
