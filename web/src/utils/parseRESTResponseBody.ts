import { object } from 'prop-types'

import { LocalRESTResponse } from 'src/contexts/reactives'

export const parseRESTResponseBody = (response: LocalRESTResponse): string => {
  if (
    response.type === 'Loading' ||
    response.type === 'NetworkFail' ||
    response.type === 'ScriptFail' //||
    //response.type === 'Fail'
  ) {
    return ''
  }

  //console.log('parseRESTResponseBody')
  //console.log(response.body)
  //console.log(typeof response.body)
  //
  if (typeof response.body === 'string') {
    return response.body
  } else {
    return JSON.stringify(response.body, null, 2)
    //const res = new TextDecoder('utf-8').decode(response.body)
    // HACK: Temporary trailing null character issue from the extension fix
    //return res.replace(/\0+$/, '')
  }
}
