import React from 'react'
import { Editor } from '@tiptap/react'
import { Button } from '@workspace/text-editor/tiptap/components/tiptap-ui-primitive/button'
import { TableIcon } from '@workspace/text-editor/tiptap/components/tiptap-icons/table-icon'
import './table-button.scss'

interface TableButtonProps {
  editor: Editor
}

export const TableButton: React.FC<TableButtonProps> = ({ editor }) => {
  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <Button
      onClick={insertTable}
      disabled={!editor.can().insertTable()}
      className={editor.isActive('table') ? 'is-active' : ''}
      title="테이블 삽입"
    >
      <TableIcon />
    </Button>
  )
} 