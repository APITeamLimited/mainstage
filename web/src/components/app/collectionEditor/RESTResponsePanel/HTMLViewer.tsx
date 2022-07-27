export const HTMLViewer = ({ html }: { html: string }) => {
  // Filter newline characters from html
  const filteredHTML = html.replaceAll(/\n/g, '')

  return (
    <iframe
      sandbox="allow-same-origin"
      srcDoc={filteredHTML}
      title="APITEam Response"
      style={{
        height: '100%',
        width: '100%',
        border: 'none',
        backgroundColor: 'white',
      }}
    />
  )
}
