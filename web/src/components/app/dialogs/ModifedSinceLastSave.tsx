import { QuerySaveDialog, QuerySaveDialogProps } from './QuerySaveDialog'

export const ModifedSinceLastSave = ({
  show,
  onClose,
  saveCallback,
  onDelete,
  title = 'Modifed Since Last Save',
  description = 'This item has been modified since the last save. Are you sure you want to overwrite the last save?',
}: QuerySaveDialogProps) => (
  <QuerySaveDialog
    show={show}
    onClose={onClose}
    saveCallback={saveCallback}
    onDelete={onDelete}
    title={title}
    description={description}
  />
)
