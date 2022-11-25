import { useMemo } from 'react'

import { Stack, useTheme, Typography } from '@mui/material'

import { markdownLineSpacing } from 'src/components/utils/Markdown'

const getAdaptiveSrc = (src: string, mode: 'light' | 'dark') => {
  // Split at the file extension (last full stop)
  const [before, after] = src.split(/(\.[^.]+)$/)
  return `${before}-${mode}${after}`
}

type DocImageProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> & {
  adaptive?: boolean
  description?: string
}

export const DocImage = (props: DocImageProps) => {
  const theme = useTheme()

  const adaptiveSrc = useMemo(() => {
    const base =
      props.adaptive && props.src
        ? getAdaptiveSrc(props.src, theme.palette.mode)
        : props.src

    return `${window.location.origin}/public/docs/${base}`
  }, [props.adaptive, props.src, theme.palette.mode])

  const adaptiveProps = useMemo(
    () => ({
      style: {
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
        maxWidth: '500px',
        ...props.style,
      },
      ...props,
      src: adaptiveSrc,
      adaptive: undefined,
    }),
    [adaptiveSrc, props]
  )

  return (
    <Stack
      spacing={1}
      sx={{
        mb: markdownLineSpacing,
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...adaptiveProps} />
      {props.description && (
        <Typography variant="caption" align="center" color="text.secondary">
          {props.description}
        </Typography>
      )}
    </Stack>
  )
}
