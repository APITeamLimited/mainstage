import { Box } from '@mui/material'

export const RawViewer = ({ rawBody }: { rawBody: string }) => {
  return (
    <Box
      sx={{
        display: 'block',
        marginBottom: '2em',
        height: 'calc(100% - 10em)',
        overflowY: 'scroll',
        maxWidth: '100%',
        paddingRight: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          height: 'max-content',
          marginBottom: '2em',
        }}
      >
        {rawBody}
      </Box>
    </Box>
  )
}
