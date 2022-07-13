import { useState } from 'react'

import { Box } from '@mui/material'

import { KeyValueEditor, KeyValueItem } from '../KeyValueEditor'

export const HeadersPanel = () => {
  const [headers, setHeaders] = useState<KeyValueItem[]>([
    {
      id: 0,
      keyString: 'aaaa',
      value: 'vvv',
      enabled: true,
    },
    {
      id: 1,
      keyString: 'aaaa',
      value: 'vvv',
      enabled: true,
    },
  ])

  return (
    <Box
      sx={{
        margin: 2,
      }}
    >
      <KeyValueEditor items={headers} setItems={setHeaders} />
    </Box>
  )
}
