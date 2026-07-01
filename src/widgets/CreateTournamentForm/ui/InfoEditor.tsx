'use client';

import { Button } from '@/shared/ui/button';
import { TextStyleKit } from '@tiptap/extension-text-style'; // Твой импорт
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Palette } from 'lucide-react';

interface TextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const ACCENT_VAR = 'var(--m-accent)';

export default function InfoEditor({ content, onChange }: TextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyleKit, // Юзаем твой пак
    ],
    content: content,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class:
          'prose max-w-none focus:outline-none min-h-[150px] p-3 border rounded-md bg-background text-foreground tiptap-content',
      },
    },
  });

  if (!editor) return null;

  // Проверяем, активен ли стиль с нашей переменной
  const isAccentActive = editor.isActive('textStyle', { color: ACCENT_VAR });

  return (
    <div className='border rounded-lg overflow-hidden bg-muted/20'>
      <div className='flex gap-1 p-2 border-b bg-muted/50'>
        {/* Кнопка: Жирный */}
        <Button
          type='button'
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          size='sm'
          onClick={() => editor.chain().focus().toggleBold().run()}
          className='h-8 w-8 p-0 cursor-pointer'
        >
          <Bold className='h-4 w-4' />
        </Button>

        {/* Кнопка: Красим в var(--m-accent) через стандартный toggleMark */}
        <Button
          type='button'
          variant={isAccentActive ? 'default' : 'outline'}
          size='sm'
          onClick={() => {
            // toggleMark сам уберет цвет, если он уже есть, или наложит, если его нет
            editor
              .chain()
              .focus()
              .toggleMark('textStyle', { color: ACCENT_VAR })
              .run();
          }}
          className='h-8 w-8 p-0 cursor-pointer'
        >
          <Palette className='h-4 w-4' style={{ color: ACCENT_VAR }} />
        </Button>
      </div>

      <EditorContent editor={editor} />

      <style>{`
        .tiptap-content strong {
          font-weight: 700 !important;
        }
        .tiptap-content p {
          margin: 0 0 8px 0;
        }
      `}</style>
    </div>
  );
}
