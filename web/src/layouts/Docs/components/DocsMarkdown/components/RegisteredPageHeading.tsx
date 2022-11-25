import { useEffect, useRef } from 'react'

import { Typography, TypographyProps } from '@mui/material'

import {
  useRegisterDocHeading,
  useDocsHeadings,
} from 'src/layouts/Docs/DocHeadingsProvider'

export type RegisteredPageHeadingProps = TypographyProps & {
  actualVariant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const RegisteredPageHeading = (props: RegisteredPageHeadingProps) => {
  const registerHeading = useRegisterDocHeading()
  const pageHeadings = useDocsHeadings()

  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // Ensure that the heading is not already registered

    const isHeadingRegistered = pageHeadings.some(
      (heading) => heading.title === props.children?.toString()
    )

    if (isHeadingRegistered) {
      return
    }

    registerHeading({
      title: props.children?.toString() ?? '',
      ref,
      depth: getHeadingDepth(props.actualVariant),
    })
  }, [registerHeading, props.actualVariant, props.children, pageHeadings])

  return <Typography {...props} ref={ref} />
}

// Converts heading h1 to 1, h2 to 2, etc.
const getHeadingDepth = (
  actualVariant: RegisteredPageHeadingProps['actualVariant']
) => {
  return Number(actualVariant.replace('h', '')) - 1
}
