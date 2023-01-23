/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { CSSProperties, ReactNode } from 'react'

import { Box, Item } from 'react-html-email'

export type EmailProps = {
  align?: 'left' | 'center' | 'right' | undefined
  bgcolor?: string | undefined
  bodyStyle?: CSSProperties | undefined
  cellPadding?: number | undefined
  cellSpacing?: number | undefined
  children?: ReactNode | undefined
  headCSS?: string | undefined
  lang?: string | undefined
  style?: CSSProperties | undefined
  title: string
  valign?: 'top' | 'middle' | 'bottom' | undefined
  width?: string | undefined
}

// inspired by http://htmlemailboilerplate.com
export default function Email(props: EmailProps) {
  // default nested 600px wide outer table container (see http://templates.mailchimp.com/development/html/)
  return (
    // @ts-ignore
    <html lang={props.lang} xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto:200,300,400,500,600,700,800,900"
          rel="stylesheet"
          type="text/css"
        />
        <title>{props.title}</title>
        {props.headCSS && <style type="text/css">{props.headCSS}</style>}
      </head>
      <body
        style={{
          width: '100%',
          margin: 0,
          padding: 0,
          WebkitTextSizeAdjust: '100%',
          // @ts-ignore
          MsTextSizeAdjust: '100%',
          ...props.bodyStyle,
        }}
      >
        <Box width="100%" height="100%" bgcolor={props.bgcolor}>
          <Item align={props.align} valign={props.valign}>
            <Box
              width={props.width}
              align="center"
              cellPadding={props.cellPadding}
              cellSpacing={props.cellSpacing}
              style={props.style}
            >
              {props.children}
            </Box>
          </Item>
        </Box>
      </body>
    </html>
  )
}

Email.defaultProps = {
  lang: 'en',
  width: '600',
  align: 'center',
  valign: 'top',
  bgcolor: undefined,
  cellPadding: undefined,
  cellSpacing: undefined,
  style: undefined,
  headCSS: undefined,
  bodyStyle: undefined,
  children: undefined,
}
