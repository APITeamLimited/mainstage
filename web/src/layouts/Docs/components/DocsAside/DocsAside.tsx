import { useMemo } from 'react'

import { Drawer, List, Paper, useMediaQuery, useTheme } from '@mui/material'

import { useDocsContent } from 'src/contexts/imports/docs-content-provider'
import { FOOTER_SPASH_HEIGHT } from 'src/layouts/Landing/components/FooterSplash'

import { AsideContent } from './AsideContent'

export const docsAsideWidth = 240

type DocsAsideProps = {
  open: boolean
  setOpen: (open: boolean) => void
  footerHeights: Record<'xs' | 'md', string>
}

export const DocsAside = ({ open, setOpen }: DocsAsideProps) => {
  const theme = useTheme()

  const docsContent = useDocsContent()

  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

  const innerContent = useMemo(
    () => (
      <List
        sx={{
          padding: 0,
        }}
      >
        {docsContent.map((item, index) => (
          <AsideContent
            content={item}
            key={index}
            hideAside={() => setOpen(false)}
            root
          />
        ))}
      </List>
    ),
    [docsContent, setOpen]
  )

  return isSmall ? (
    <Drawer
      open={isSmall ? open : true}
      onClose={() => setOpen(false)}
      variant={isSmall ? 'temporary' : 'permanent'}
      sx={{
        width: docsAsideWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: docsAsideWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {innerContent}
    </Drawer>
  ) : (
    <Paper
      sx={{
        borderRadius: 0,
        width: docsAsideWidth - 1,
        borderRight: `1px solid ${theme.palette.divider}`,
        minHeight: '100%',
      }}
    >
      {innerContent}
    </Paper>
  )
}
