import { useMemo, useState } from 'react'

import type { Chapter, DocsPage } from '@apiteam/types/src'
import ExpandMore from '@mui/icons-material/ExpandMore'
import {
  ListItemButton,
  ListItemText,
  Collapse,
  List,
  Stack,
  useTheme,
} from '@mui/material'

import { navigate, useLocation } from '@redwoodjs/router'

type AsideContentProps = {
  content: Chapter | DocsPage
  hideAside: () => void
  previousSlugs?: string[]
  root?: boolean
}

export const AsideContent = ({
  content,
  hideAside,
  previousSlugs = [],
  root,
}: AsideContentProps) => {
  const theme = useTheme()

  const { pathname } = useLocation()

  const [collapseIn, setCollapseIn] = useState(false)

  const fullPath = useMemo(
    () => `/${[...previousSlugs, content.slug].join('/')}`,
    [content.slug, previousSlugs]
  )

  const handleContentClick = () => {
    setCollapseIn(true)
    navigate(fullPath)
    hideAside()
  }

  return (
    <>
      <Stack direction="row" alignItems="center">
        <ListItemButton
          onClick={handleContentClick}
          sx={{
            flexGrow: 1,
            height: '40px',
          }}
        >
          <ListItemText
            primary={
              <span>
                {content.title}
                {pathname === fullPath && <>&nbsp;&nbsp;👈</>}
              </span>
            }
            primaryTypographyProps={{
              variant: 'body1',
              color: theme.palette.text.primary,
              fontWeight: 'bold',
            }}
          />
        </ListItemButton>
        {content.variant === 'chapter' && !root && (
          <ListItemButton
            onClick={() => setCollapseIn(!collapseIn)}
            sx={{
              height: '100%',
              maxWidth: '50px',
              width: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {collapseIn ? (
              <ExpandMore
                sx={{
                  width: '24px',
                  height: '24px',
                  margin: 0,
                  padding: 0,
                  color: theme.palette.text.primary,
                }}
              />
            ) : (
              <ExpandMore
                sx={{
                  // Rotate 90 degrees
                  transform: 'rotate(90deg)',
                  width: '24px',
                  height: '24px',
                  margin: 0,
                  padding: 0,
                  color: theme.palette.text.primary,
                }}
              />
            )}
          </ListItemButton>
        )}
      </Stack>
      {content.variant === 'chapter' && !root && (
        <Collapse
          in={collapseIn}
          timeout="auto"
          sx={{
            pl: 2,
          }}
        >
          <List
            sx={{
              padding: 0,
            }}
          >
            {content.content.map((item, index) => (
              <AsideContent
                content={item}
                key={index}
                hideAside={hideAside}
                previousSlugs={[...previousSlugs, content.slug]}
              />
            ))}
          </List>
        </Collapse>
      )}
      {root && content.variant === 'chapter' && (
        <List
          sx={{
            padding: 0,
          }}
        >
          {content.content.map((item, index) => (
            <AsideContent
              content={item}
              key={index}
              hideAside={hideAside}
              previousSlugs={[...previousSlugs, content.slug]}
            />
          ))}
        </List>
      )}
    </>
  )
}
