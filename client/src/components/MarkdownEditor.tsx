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
  const viewRef = useRef<EditorView | null>(null);
  const isExternalUpdate = useRef(false);

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
            // 外部からの更新の場合はonChangeを呼び出さない
            if (!isExternalUpdate.current) {
              const newValue = update.state.doc.toString();
              onChange(newValue);
            }
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

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  // 外部からの値の変更を反映
  useEffect(() => {
    if (viewRef.current) {
      const currentValue = viewRef.current.state.doc.toString();
      if (currentValue !== value) {
        // 外部からの更新であることを示すフラグを設定
        isExternalUpdate.current = true;
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value
          }
        });
        // フラグをリセット（次のイベントループで）
        setTimeout(() => {
          isExternalUpdate.current = false;
        }, 0);
      }
    }
  }, [value]);

  return <div ref={editorRef} className="h-full w-full" />;
}

