export const getLexicalModule = async () => {
  return await import('lexical')
}

export type LexicalModule = Awaited<ReturnType<typeof getLexicalModule>>

export const getLexicalAddons = async () => {
  const [
    LexicalComposerModule,
    ClearEditorPluginModule,
    useLexicalComposerContextModule,
    ContentEditableModule,
    HistoryPluginModule,
    OnChangePluginModule,
    PlainTextPluginModule,
  ] = await Promise.all([
    import('@lexical/react/LexicalComposer'),
    import('@lexical/react/LexicalClearEditorPlugin'),
    import('@lexical/react/LexicalComposerContext'),
    import('@lexical/react/LexicalContentEditable'),
    import('@lexical/react/LexicalHistoryPlugin'),
    import('@lexical/react/LexicalOnChangePlugin'),
    import('@lexical/react/LexicalPlainTextPlugin'),
  ])

  return {
    LexicalComposer: LexicalComposerModule.LexicalComposer,
    ClearEditorPlugin: ClearEditorPluginModule.ClearEditorPlugin,
    useLexicalComposerContext:
      useLexicalComposerContextModule.useLexicalComposerContext,
    ContentEditable: ContentEditableModule.ContentEditable,
    HistoryPlugin: HistoryPluginModule.HistoryPlugin,
    OnChangePlugin: OnChangePluginModule.OnChangePlugin,
    PlainTextPlugin: PlainTextPluginModule.PlainTextPlugin,
  }
}

export type LexicalAddons = Awaited<ReturnType<typeof getLexicalAddons>>
