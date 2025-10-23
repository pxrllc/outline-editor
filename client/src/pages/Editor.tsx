import { useEffect, useState } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import MarkdownEditor from '@/components/MarkdownEditor';
import OutlineView from '@/components/OutlineView';
import MarkdownPreview from '@/components/MarkdownPreview';
import PlainTextView from '@/components/PlainTextView';
import ViewModeToolbar from '@/components/ViewModeToolbar';
import Minimap from '@/components/Minimap';
import CharacterStats from '@/components/CharacterStats';
import TagManager from '@/components/TagManager';
import SaveDialog from '@/components/SaveDialog';
import ProjectSidebar from '@/components/ProjectSidebar';
import SynopsisEditor from '@/components/SynopsisEditor';
import NotesEditor from '@/components/NotesEditor';
import { parseOutline } from '@/lib/outline';
import { OutlineItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Save, FileText, Menu, BarChart, BookOpen, Layers } from 'lucide-react';

type EditorMode = 'document' | 'synopsis' | 'notes';

export default function Editor() {
  const {
    currentProject,
    currentDocumentId,
    viewMode,
    outlineItems,
    selectedText,
    setViewMode,
    setOutlineItems,
    setCurrentDocumentId,
    updateDocumentContent,
    getCurrentDocument,
    createNewDocument,
    deleteDocument,
    saveProject,
    setCurrentProject,
    setSelectedText,
    setCursorPosition,
    updateProjectSynopsis,
    updateProjectNotes
  } = useEditor();

  const [showProjectSidebar, setShowProjectSidebar] = useState(true);
  const [showOutlineSidebar, setShowOutlineSidebar] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('document');
  
  const currentDoc = getCurrentDocument();

  // ドキュメントの内容が変更されたらアウトラインを更新
  useEffect(() => {
    if (currentDoc && editorMode === 'document') {
      const items = parseOutline(currentDoc.content);
      setOutlineItems(items);
    }
  }, [currentDoc?.content, editorMode, setOutlineItems]);

  const handleContentChange = (newContent: string) => {
    updateDocumentContent(newContent);
  };

  const handleOutlineItemClick = (item: OutlineItem) => {
    console.log('Jump to line:', item.line);
  };

  const handleOutlineToggle = (itemId: string) => {
    const updatedItems = outlineItems.map(item =>
      item.id === itemId ? { ...item, collapsed: !item.collapsed } : item
    );
    setOutlineItems(updatedItems);
  };

  const handleMinimapLineClick = (line: number) => {
    console.log('Jump to line from minimap:', line);
  };

  const handleSave = (name: string) => {
    saveProject(name);
  };

  const handleTagUpdate = (tags: Record<string, string>) => {
    if (currentProject) {
      setCurrentProject({
        ...currentProject,
        tags,
        updatedAt: Date.now()
      });
    }
  };

  const handleDocumentCreate = (title: string) => {
    const newDoc = createNewDocument(title);
    setCurrentDocumentId(newDoc.id);
    setEditorMode('document');
  };

  const handleDocumentDelete = (documentId: string) => {
    if (confirm('このドキュメントを削除してもよろしいですか？')) {
      deleteDocument(documentId);
    }
  };

  const handleShowSynopsis = () => {
    setEditorMode('synopsis');
  };

  const handleShowNotes = () => {
    setEditorMode('notes');
  };

  const handleSynopsisSave = (synopsis: string) => {
    updateProjectSynopsis(synopsis);
  };

  const handleNotesSave = (notes: string) => {
    updateProjectNotes(notes);
  };

  if (!currentProject) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">プロジェクトを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ヘッダー */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProjectSidebar(!showProjectSidebar)}
          >
            <Layers className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOutlineSidebar(!showOutlineSidebar)}
          >
            <Menu className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold">
            {editorMode === 'synopsis' && 'あらすじ'}
            {editorMode === 'notes' && '資料ノート'}
            {editorMode === 'document' && (currentDoc?.title || '新規ドキュメント')}
          </h1>
          <span className="text-sm text-muted-foreground">
            {currentProject.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {editorMode === 'document' && currentDoc && (
            <>
              <span className="text-sm text-muted-foreground">
                {currentDoc.content.length.toLocaleString()} 文字
              </span>
              <Button
                variant={showStats ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setShowStats(!showStats);
                  if (!showStats) setShowTags(false);
                }}
              >
                <BarChart className="w-4 h-4" />
              </Button>
              <Button
                variant={showTags ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setShowTags(!showTags);
                  if (!showTags) setShowStats(false);
                }}
              >
                <BookOpen className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => setSaveDialogOpen(true)}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </header>

      {/* ビューモード切り替え（ドキュメントモードのみ） */}
      {editorMode === 'document' && (
        <ViewModeToolbar currentMode={viewMode} onModeChange={setViewMode} />
      )}

      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {/* プロジェクトサイドバー */}
        {showProjectSidebar && (
          <ProjectSidebar
            project={currentProject}
            currentDocumentId={currentDocumentId}
            onDocumentSelect={(id) => {
              setCurrentDocumentId(id);
              setEditorMode('document');
            }}
            onDocumentCreate={handleDocumentCreate}
            onDocumentDelete={handleDocumentDelete}
            onShowSynopsis={handleShowSynopsis}
            onShowNotes={handleShowNotes}
          />
        )}

        {/* アウトラインサイドバー（ドキュメントモードのみ） */}
        {showOutlineSidebar && editorMode === 'document' && (
          <div className="w-64 flex-shrink-0 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <OutlineView
                items={outlineItems}
                onItemClick={handleOutlineItemClick}
                onToggle={handleOutlineToggle}
              />
            </div>
            {showStats && currentDoc && (
              <CharacterStats
                content={currentDoc.content}
                selectedText={selectedText}
              />
            )}
          </div>
        )}

        {/* エディタエリア */}
        <div className="flex-1 overflow-hidden">
          {editorMode === 'synopsis' && (
            <SynopsisEditor
              synopsis={currentProject.synopsis}
              onSave={handleSynopsisSave}
              onClose={() => setEditorMode('document')}
            />
          )}
          
          {editorMode === 'notes' && (
            <NotesEditor
              notes={currentProject.notes}
              onSave={handleNotesSave}
              onClose={() => setEditorMode('document')}
            />
          )}
          
          {editorMode === 'document' && currentDoc && (
            <>
              {viewMode === 'markdown' && (
                <MarkdownEditor
                  value={currentDoc.content}
                  onChange={handleContentChange}
                  onSelectionChange={setSelectedText}
                  onCursorChange={setCursorPosition}
                />
              )}
              {viewMode === 'preview' && (
                <MarkdownPreview content={currentDoc.content} />
              )}
              {viewMode === 'plain' && (
                <PlainTextView content={currentDoc.content} />
              )}
              {viewMode === 'outline' && (
                <div className="h-full overflow-y-auto p-8">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">アウトライン表示</h2>
                    <div className="space-y-2">
                      {outlineItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-2 hover:bg-accent rounded cursor-pointer"
                          style={{ paddingLeft: `${item.level * 16}px` }}
                          onClick={() => handleOutlineItemClick(item)}
                        >
                          <span style={{ fontSize: `${20 - item.level * 2}px` }}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {editorMode === 'document' && !currentDoc && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg text-muted-foreground mb-4">
                  ドキュメントが選択されていません
                </p>
                <Button onClick={() => handleDocumentCreate('新規ドキュメント')}>
                  新規ドキュメントを作成
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 右サイドバー（ミニマップまたはタグ、ドキュメントモードのみ） */}
        {editorMode === 'document' && currentDoc && (
          <>
            {showTags ? (
              <div className="w-80 flex-shrink-0">
                <TagManager
                  content={currentDoc.content}
                  tags={currentProject.tags}
                  onTagUpdate={handleTagUpdate}
                />
              </div>
            ) : showMinimap ? (
              <Minimap
                content={currentDoc.content}
                outlineItems={outlineItems}
                onLineClick={handleMinimapLineClick}
              />
            ) : null}
          </>
        )}
      </div>

      {/* 保存ダイアログ */}
      <SaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        currentName={currentProject.name}
        onSave={handleSave}
      />
    </div>
  );
}

