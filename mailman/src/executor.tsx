import React from 'react'

import CSSInliner from 'css-inliner'
import { renderEmail } from 'react-html-email'

import { MailmanInput, MailmanOutput } from './lib'
import { MailmanProvider } from './MailmanProvider'
import { VALID_TEMPLATES } from './templates'

const inliner = new CSSInliner()

export const handleRenderRequest = async (
  input: MailmanInput<unknown>
): Promise<MailmanOutput> => {
  const { template: templateName } = input

  console.log(`Received render request for template '${templateName}'`)

  const template = VALID_TEMPLATES[templateName]

  if (!template) {
    return {
      content: null,
      error: `Invalid template identifier: ${template}`,
    }
  }

  try {
    const rawHTML = renderEmail(
      <MailmanProvider input={input}>
        {
          // Init template
          React.createElement(template.html, input)
        }
      </MailmanProvider>
    ).replace(
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html lang="en" xmlns="http://www.w3.org/1999/xhtml">',
      '<!DOCTYPE html><html lang="en">'
    )

    // Need to inline CSS for Gmail to render properly
    const inlinedHTML = (await new Promise((resolve, reject) => {
      inliner.inlineCSSAsync(rawHTML).then(resolve).catch(reject)
    })) as string

    return {
      content: {
        html: inlinedHTML,
        text: template.text(input),
        title: template.title(input),
      },
      error: null,
    }
  } catch (error) {
    return {
      content: null,
      error: error.toString(),
    }
  }
}
