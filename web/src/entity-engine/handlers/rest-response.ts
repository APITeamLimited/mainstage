export const deleteRestResponse = (responses: YMap<any>[]) => {
  const parent = responses[0].parent as YMap<any>

  if (!parent) {
    throw new Error('deleteRestResponse: parent not found')
  }

  for (const response of responses) {
    // todo: Check for any stored values first

    parent.delete(response.get('id'))
  }
}
