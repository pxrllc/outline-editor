import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, type Extension } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSelectionChange?: (selection: string) => void;
  onCursorChange?: (position: number) => void;
}

export default function MarkdownEditor({ 
  value, 
  onChange, 
  onSelectionChange,
  onCursorChange 
}: MarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        markdown(),
        oneDark,
        EditorView.updateListener.of((update: any) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
          }
          
          // 選択範囲の変更を検知
          if (update.selectionSet) {
            const selection = update.state.sliceDoc(
              update.state.selection.main.from,
              update.state.selection.main.to
            );
            onSelectionChange?.(selection);
            onCursorChange?.(update.state.selection.main.head);
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px'
          },
          '.cm-scroller': {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
          },
          '.cm-content': {
            padding: '16px'
          }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current
    });



    return () => {
      view.destroy();
    };
  }, []);



  return <div ref={editorRef} className="h-full w-full" />;
}

