import { coreCacheReadRedis, orchestratorReadRedis } from '../redis'

export const forwardGlobalTestStatistics = async () => {
  performStartupCleanup()

  setInterval(async () => {
    try {
      const orchestratorIdsPromise =
        orchestratorReadRedis.sMembers('orchestrators')
      const workerIdsPromise = orchestratorReadRedis.sMembers('workers')

      const [orchestratorIds, workerIds] = await Promise.all([
        orchestratorIdsPromise,
        workerIdsPromise,
      ])

      const orchestratorInfoPromises = orchestratorIds.map((id) =>
        orchestratorReadRedis.hGetAll(`orchestrator:${id}:info`)
      )

      const workerInfoPromises = workerIds.map((id) =>
        orchestratorReadRedis.hGetAll(`worker:${id}:info`)
      )

      const orchestratorStatsPromise = orchestratorReadRedis.hGetAll(
        'orchestrator:master:info'
      )
      const loadZonesPromise = orchestratorReadRedis.sMembers('loadZones')

      const [orchestratorInfo, workerInfo, orchestratorStats, loadZones] =
        await Promise.all([
          Promise.all(orchestratorInfoPromises),
          Promise.all(workerInfoPromises),
          orchestratorStatsPromise,
          loadZonesPromise,
        ])

      // Get all the load zones
      const loadZonesInfoPromises = loadZones.map((zoneName) =>
        orchestratorReadRedis.hGetAll(`loadZone:${zoneName}:info`)
      )

      const loadZonesInfo = await Promise.all(loadZonesInfoPromises)

      // Relay all info to the core cache

      // Orchestrators
      const setOrchestratorInfoPromises = orchestratorInfo.map(
        async (info) =>
          await Promise.all(
            Object.entries(info).map(([key, value]) =>
              coreCacheReadRedis.hSet(
                `orchestrator:${info.id}:info`,
                key,
                value
              )
            )
          )
      )

      // Orchestrator stats
      const setOrchestratorStatsPromises = Object.entries(
        orchestratorStats
      ).map(([key, value]) =>
        coreCacheReadRedis.hSet('orchestrator:master:info', key, value)
      )

      // Workers
      const setWorkerInfoPromises = workerInfo.map(
        async (info) =>
          await Promise.all(
            Object.entries(info).map(([key, value]) =>
              coreCacheReadRedis.hSet(`worker:${info.id}:info`, key, value)
            )
          )
      )

      // Load Zones
      const existingLoadZones = await coreCacheReadRedis.sMembers('loadZones')
      const removedLoadZones = existingLoadZones.filter(
        (zone) => !loadZones.includes(zone)
      )

      if (removedLoadZones.length > 0) {
        coreCacheReadRedis.sRem('loadZones', removedLoadZones)
      }

      if (loadZones.length > 0) {
        coreCacheReadRedis.sAdd('loadZones', loadZones)
      }

      const setLoadZoneInfoPromises = loadZonesInfo.map(
        async (info) =>
          await Promise.all(
            Object.entries(info).map(([key, value]) =>
              coreCacheReadRedis.hSet(`loadZone:${info.name}:info`, key, value)
            )
          )
      )

      await Promise.all([
        ...setOrchestratorInfoPromises,
        ...setOrchestratorStatsPromises,
        ...setWorkerInfoPromises,
        ...setLoadZoneInfoPromises,
      ])
    } catch (error) {
      console.error(`Error forwarding GlobeTest statistics: ${error}`)
    }
  }, 1000)
}

const performStartupCleanup = async () => {
  const orchestratorKeys = await orchestratorReadRedis.keys(
    'orchestrator:*:info'
  )
  await Promise.all(
    orchestratorKeys.map((key) => orchestratorReadRedis.del(key))
  )

  const workerKeys = await orchestratorReadRedis.keys('orchestrator:*:info')
  await Promise.all(workerKeys.map((key) => orchestratorReadRedis.del(key)))
}
