import { useState, useEffect, useRef } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { OutlineItem } from '@/types';
import { parseOutline } from '@/lib/outline';
import { reorderMarkdownByOutline, changeHeadingLevel } from '@/lib/markdown-structure';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Save, 
  Menu, 
  FolderOpen,
  Map,
  BarChart,
  BookOpen
} from 'lucide-react';
import MarkdownEditor from '@/components/MarkdownEditor';
import OutlineView from '@/components/OutlineView';
import MarkdownPreview from '@/components/MarkdownPreview';
import PlainTextView from '@/components/PlainTextView';
import ViewModeToolbar from '@/components/ViewModeToolbar';
import ProjectSidebar from '@/components/ProjectSidebar';
import SynopsisEditor from '@/components/SynopsisEditor';
import NotesEditor from '@/components/NotesEditor';
import CharacterStats from '@/components/CharacterStats';
import TagManager from '@/components/TagManager';
import FloatingMinimap from '@/components/FloatingMinimap';
import SaveDialog from '@/components/SaveDialog';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

type ViewMode = 'outline' | 'markdown' | 'preview' | 'plain';
type EditorMode = 'document' | 'synopsis' | 'notes';

export default function Editor() {
  const {
    currentProject,
    currentDocumentId,
    setCurrentDocumentId,
    updateDocumentContent,
    updateDocumentTitle,
    getCurrentDocument,
    createNewDocument,
    deleteDocument,
    saveProject,
    updateProjectSynopsis,
    updateProjectNotes,
  } = useEditor();
  
  const currentDoc = getCurrentDocument();

  const [viewMode, setViewMode] = useState<ViewMode>('markdown');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  // viewMode変更をログ出力
  useEffect(() => {
    console.log('=== viewMode changed ===', viewMode);
  }, [viewMode]);
  const [editorMode, setEditorMode] = useState<EditorMode>('document');
  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ line: 0, ch: 0 });
  const [showProjectSidebar, setShowProjectSidebar] = useState(true);
  const [showOutlineSidebar, setShowOutlineSidebar] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showFloatingMinimap, setShowFloatingMinimap] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  // localStorageのみでコンテンツを管理するため、refは不要

  useEffect(() => {
    if (currentDoc) {
      console.log('=== useEffect parsing outline ===');
      console.log('Current doc:', currentDoc);
      console.log('Content length:', currentDoc.content?.length);
      console.log('Content preview:', currentDoc.content?.substring(0, 200));
      const outline = parseOutline(currentDoc.content || '');
      console.log('Parsed outline:', outline);
      setOutlineItems(outline);
    } else {
      console.log('No current doc');
      setOutlineItems([]);
    }
  }, [currentDoc, viewMode]);

  const handleContentChange = (newContent: string) => {
    // 即座にlocalStorageに保存
    updateDocumentContent(newContent);
  };

  const handleOutlineItemClick = (item: OutlineItem) => {
    console.log('Navigate to line:', item.line);
  };

  const handleOutlineToggle = (itemId: string) => {
    const updatedItems = outlineItems.map(item =>
      item.id === itemId ? { ...item, collapsed: !item.collapsed } : item
    );
    setOutlineItems(updatedItems);
  };

  const handleOutlineReorder = (newItems: OutlineItem[]) => {
    if (!currentDoc) return;
    
    console.log('=== handleOutlineReorder ===');
    console.log('Old items:', outlineItems.map(i => i.text));
    console.log('New items:', newItems.map(i => i.text));
    
    // Markdownドキュメントの構造を並び替える
    const newContent = reorderMarkdownByOutline(currentDoc.content, outlineItems, newItems);
    
    console.log('Old content:', currentDoc.content);
    console.log('New content:', newContent);
    
    updateDocumentContent(newContent);
    // setOutlineItemsは削除 - useEffectで自動的に更新される
  };

  const handleIndentChange = (itemId: string, newLevel: number) => {
    if (!currentDoc) return;
    
    const item = outlineItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Markdownの見出しレベルを変更（子要素も含めて）
    const newContent = changeHeadingLevel(
      currentDoc.content,
      item.line,
      item.level,
      newLevel,
      true // 子要素も含めて変更
    );
    
    updateDocumentContent(newContent);
  };

  const handleMinimapLineClick = (line: number) => {
    console.log('Jump to line from minimap:', line);
  };

  const handleSave = (name: string) => {
    saveProject(name);
  };

  const handleDocumentCreate = (name: string) => {
    createNewDocument(name);
  };

  const handleDocumentDelete = (id: string) => {
    deleteDocument(id);
  };

  const handleShowSynopsis = () => {
    setEditorMode('synopsis');
  };

  const handleShowNotes = () => {
    setEditorMode('notes');
  };

  const handleSynopsisSave = (synopsis: string) => {
    if (currentProject) {
      updateProjectSynopsis(synopsis);
    }
  };

  const handleNotesSave = (notes: string) => {
    if (currentProject) {
      updateProjectNotes(notes);
    }
  };

  // レイアウトの判定
  const isOutlineView = viewMode === 'outline';
  const isPreviewView = viewMode === 'preview';
  
  console.log('=== Layout ===', { viewMode, isOutlineView, isPreviewView, editorMode });
  const showRightPanel = (editorMode === 'synopsis' || editorMode === 'notes') || 
                         (isPreviewView && editorMode === 'document');

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ヘッダー */}
      <header className="border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProjectSidebar(!showProjectSidebar)}
          >
            <FolderOpen className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOutlineSidebar(!showOutlineSidebar)}
          >
            <Menu className="w-4 h-4" />
          </Button>
          {isEditingTitle && currentDoc ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={() => {
                if (editedTitle.trim()) {
                  updateDocumentTitle(editedTitle.trim());
                }
                setIsEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (editedTitle.trim()) {
                    updateDocumentTitle(editedTitle.trim());
                  }
                  setIsEditingTitle(false);
                } else if (e.key === 'Escape') {
                  setIsEditingTitle(false);
                }
              }}
              className="text-lg font-semibold bg-transparent border-b border-primary focus:outline-none px-2"
              autoFocus
            />
          ) : (
            <h1 
              className="text-lg font-semibold cursor-pointer hover:text-primary transition-colors px-2"
              onClick={() => {
                if (currentDoc) {
                  setEditedTitle(currentDoc.title);
                  setIsEditingTitle(true);
                }
              }}
            >
              {currentDoc?.title || currentProject?.name || 'プロジェクト'}
            </h1>
          )}
          <span className="text-sm text-muted-foreground">{currentProject?.name}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {editorMode === 'document' && (
            <>
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
              <Button
                variant={showFloatingMinimap ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setShowFloatingMinimap(!showFloatingMinimap)}
              >
                <Map className="w-4 h-4" />
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
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* プロジェクトサイドバー */}
          {showProjectSidebar && (
            <>
              <Panel defaultSize={15} minSize={10} maxSize={30}>
                {currentProject && (
                  <ProjectSidebar
                    project={currentProject}
                  currentDocumentId={currentDocumentId}
                  onDocumentSelect={(id) => {
                    // ドキュメント切り替え（localStorageには既に保存済み）
                    setCurrentDocumentId(id);
                    setEditorMode('document');
                  }}
                  onDocumentCreate={handleDocumentCreate}
                  onDocumentDelete={handleDocumentDelete}
                  onShowSynopsis={handleShowSynopsis}
                  onShowNotes={handleShowNotes}
                  />
                )}
              </Panel>
              <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
            </>
          )}

          {/* アウトラインビュー時: アウトライン + エディタの2カラム */}
          {isOutlineView && editorMode === 'document' && currentDoc && (
            <>
              <Panel defaultSize={25} minSize={15} maxSize={40}>
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-hidden">
                    <OutlineView
                      items={outlineItems}
                      onItemClick={handleOutlineItemClick}
                      onToggle={handleOutlineToggle}
                      onReorder={handleOutlineReorder}
                      onIndentChange={handleIndentChange}
                    />
                  </div>
                  {showStats && (
                    <CharacterStats
                      content={currentDoc.content}
                      selectedText={selectedText}
                    />
                  )}
                  {showTags && (
                    <TagManager 
                      content={currentDoc.content}
                      tags={{}}
                      onTagUpdate={() => {}}
                    />
                  )}
                </div>
              </Panel>
              <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
              <Panel defaultSize={75} minSize={50}>
                <div className="h-full overflow-y-auto p-8">
                  <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">アウトライン表示</h2>
                    <p className="text-sm text-muted-foreground mb-2">Items: {outlineItems.length}</p>
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
              </Panel>
            </>
          )}

          {/* プレビュービュー時: エディタ + プレビューの2カラム */}
          {isPreviewView && editorMode === 'document' && currentDoc && (
            <>
              <Panel defaultSize={50} minSize={30}>
                <MarkdownEditor
                  value={currentDoc.content}
                  onChange={handleContentChange}
                  onSelectionChange={setSelectedText}
                  onCursorChange={(pos) => setCursorPosition({ line: pos, ch: 0 })}
                />
              </Panel>
              <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
              <Panel defaultSize={50} minSize={30}>
                <MarkdownPreview 
                  content={currentDoc.content}
                />
              </Panel>
            </>
          )}

          {/* Markdown/Plainビュー時: 通常の3カラム（アウトライン + エディタ + ミニマップ） */}
          {!isOutlineView && !isPreviewView && editorMode === 'document' && currentDoc && (
            <>
              {showOutlineSidebar && (
                <>
                  <Panel defaultSize={15} minSize={10} maxSize={30}>
                    <div className="h-full flex flex-col">
                      <div className="flex-1 overflow-hidden">
                        <OutlineView
                          items={outlineItems}
                          onItemClick={handleOutlineItemClick}
                          onToggle={handleOutlineToggle}
                          onReorder={handleOutlineReorder}
                          onIndentChange={handleIndentChange}
                        />
                      </div>
                      {showStats && (
                        <CharacterStats
                          content={currentDoc.content}
                          selectedText={selectedText}
                        />
                      )}
                      {showTags && (
                        <TagManager 
                          content={currentDoc.content}
                          tags={{}}
                          onTagUpdate={() => {}}
                        />
                      )}
                    </div>
                  </Panel>
                  <PanelResizeHandle className="w-1 bg-border hover:bg-primary transition-colors" />
                </>
              )}
              <Panel defaultSize={70} minSize={30}>
                {viewMode === 'markdown' && (
                  <MarkdownEditor
                    value={currentDoc.content}
                    onChange={handleContentChange}
                    onSelectionChange={setSelectedText}
                    onCursorChange={(pos) => setCursorPosition({ line: pos, ch: 0 })}
                  />
                )}
                {viewMode === 'plain' && (
                  <PlainTextView 
                    content={currentDoc.content}
                    onChange={handleContentChange}
                  />
                )}
              </Panel>
            </>
          )}

          {/* あらすじ・資料ノート表示時: 右カラムに表示 */}
          {(editorMode === 'synopsis' || editorMode === 'notes') && currentProject && (
            <Panel defaultSize={85} minSize={50}>
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
            </Panel>
          )}

          {/* ドキュメントが選択されていない場合 */}
          {editorMode === 'document' && !currentDoc && (
            <Panel defaultSize={85} minSize={50}>
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
            </Panel>
          )}
        </PanelGroup>
      </div>

      {/* フローティングミニマップ */}
      {showFloatingMinimap && currentDoc && (
        <FloatingMinimap
          content={currentDoc.content}
          outlineItems={outlineItems}
          onLineClick={handleMinimapLineClick}
          onClose={() => setShowFloatingMinimap(false)}
        />
      )}

      {/* 保存ダイアログ */}
      {currentProject && (
        <SaveDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          currentProject={currentProject}
          currentDocument={currentDoc}
        />
      )}
    </div>
  );
}

