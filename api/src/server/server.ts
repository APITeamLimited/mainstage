import { FastifyInstance } from 'fastify'

export interface HttpServerParams {
  port: number
  fastify: FastifyInstance
  host?: string
}

export const startWithHostnameServer = ({
  port = 8911,
  host,
  fastify,
}: HttpServerParams) => {
  fastify.listen({ port, host })

  fastify.ready(() => {
    fastify.log.debug(
      { custom: { ...fastify.initialConfig } },
      'Fastify server configuration'
    )
    fastify.log.debug(`Registered plugins \n${fastify.printPlugins()}`)
  })

  return fastify
}
