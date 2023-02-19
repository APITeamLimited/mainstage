import { GlobeTestMessage, globeTestMessageSchema } from '.'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseGlobeTestMessage = (message: any): GlobeTestMessage => {
  try {
    message = JSON.parse(message)
  } catch (e) {
    // Do nothing
  }

  try {
    message.message = JSON.parse(message.message)
  } catch (e) {
    // Do nothing
  }

  try {
    if (message.messageType === 'CONSOLE') {
      message.message.msg = JSON.parse(message.message.msg)
    }
  } catch (error) {
    // Do nothing
  }

  if (message.workerId === '' && message.orchestratorId !== '') {
    delete message.workerId
    delete message.childJobId
  }

  if (message.orchestratorId === '' && message.workerId !== '') {
    delete message.orchestratorId
  }

  if (message.workerId && message.orchestratorId) {
    delete message.orchestratorId
  }

  if (message.workerId) {
    message.senderVariant = 'Worker'
  } else {
    message.senderVariant = 'Orchestrator'
  }

  return message
}

export const parseAndValidateGlobeTestMessage = (message: unknown) => {
  const parsedMessage = parseGlobeTestMessage(message)

  return globeTestMessageSchema.safeParse(parsedMessage)
}
