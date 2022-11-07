import { useMemo } from 'react'

import { useTheme } from '@mui/material'

import { markdownLineSpacing } from '../Markdown'

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
}

export const DocImage = (props: DocImageProps) => {
  const theme = useTheme()

  const adaptiveSrc = useMemo(() => {
    const base =
      props.adaptive && props.src
        ? getAdaptiveSrc(props.src, theme.palette.mode)
        : props.src

    return `public/docs/${base}`
  }, [props.adaptive, props.src, theme.palette.mode])

  const adaptiveProps = useMemo(
    () => ({
      style: {
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
        maxWidth: '500px',
        marginBottom: markdownLineSpacing,
        ...props.style,
      },
      ...props,
      src: adaptiveSrc,
      adaptive: undefined,
    }),
    [adaptiveSrc, props]
  )

  // eslint-disable-next-line jsx-a11y/alt-text
  return <img {...adaptiveProps} />
}
