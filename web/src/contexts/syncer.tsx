export const SyncClient = () => {
  const syncIntervalMS = 1000
  const lastResult = null

  setInterval(async () => {
    // Check if more than 1 second has passed since the last sync
    if (!(lastResult && Date.now() - lastResult.timestamp < syncIntervalMS)) {
      // Request the updates endpoint
      console.log('Requesting updates...')
    }
  }, syncIntervalMS)

  return <></>
}

const requestUpdates = async () => {}
