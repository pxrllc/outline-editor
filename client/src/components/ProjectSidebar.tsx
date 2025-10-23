import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project, Document } from '@/types';
import {
  FileText,
  Plus,
  Trash2,
  FolderOpen,
  BookOpen,
  StickyNote,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface ProjectSidebarProps {
  project: Project;
  currentDocumentId: string | null;
  onDocumentSelect: (documentId: string) => void;
  onDocumentCreate: (title: string) => void;
  onDocumentDelete: (documentId: string) => void;
  onShowSynopsis: () => void;
  onShowNotes: () => void;
}

export default function ProjectSidebar({
  project,
  currentDocumentId,
  onDocumentSelect,
  onDocumentCreate,
  onDocumentDelete,
  onShowSynopsis,
  onShowNotes
}: ProjectSidebarProps) {
  const [newDocTitle, setNewDocTitle] = useState('');
  const [showDocuments, setShowDocuments] = useState(true);
  const [showNewDocInput, setShowNewDocInput] = useState(false);

  const handleCreateDocument = () => {
    if (newDocTitle.trim()) {
      onDocumentCreate(newDocTitle.trim());
      setNewDocTitle('');
      setShowNewDocInput(false);
    }
  };

  return (
    <div className="w-64 h-full bg-background border-r border-border flex flex-col">
      {/* プロジェクト情報 */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h2 className="font-semibold truncate">{project.name}</h2>
        </div>
        <div className="text-xs text-muted-foreground">
          {project.documents.length} ドキュメント
        </div>
      </div>

      {/* ドキュメント一覧 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <button
            onClick={() => setShowDocuments(!showDocuments)}
            className="flex items-center gap-2 w-full px-2 py-1 hover:bg-accent rounded text-sm font-semibold"
          >
            {showDocuments ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <FileText className="w-4 h-4" />
            <span>ドキュメント</span>
          </button>

          {showDocuments && (
            <div className="mt-1 space-y-1">
              {project.documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
                    currentDocumentId === doc.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => onDocumentSelect(doc.id)}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-sm truncate">{doc.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDocumentDelete(doc.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}

              {showNewDocInput ? (
                <div className="px-2 py-1">
                  <Input
                    type="text"
                    placeholder="ドキュメント名"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateDocument();
                      if (e.key === 'Escape') setShowNewDocInput(false);
                    }}
                    onBlur={() => {
                      if (newDocTitle.trim()) {
                        handleCreateDocument();
                      } else {
                        setShowNewDocInput(false);
                      }
                    }}
                    autoFocus
                    className="h-7 text-sm"
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() => setShowNewDocInput(true)}
                >
                  <Plus className="w-4 h-4" />
                  新規ドキュメント
                </Button>
              )}
            </div>
          )}
        </div>

        {/* あらすじ */}
        <div className="p-2 border-t border-border">
          <button
            onClick={onShowSynopsis}
            className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-accent rounded text-sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>あらすじ</span>
          </button>
        </div>

        {/* 資料ノート */}
        <div className="p-2">
          <button
            onClick={onShowNotes}
            className="flex items-center gap-2 w-full px-2 py-1.5 hover:bg-accent rounded text-sm"
          >
            <StickyNote className="w-4 h-4" />
            <span>資料ノート</span>
          </button>
        </div>
      </div>
    </div>
  );
}

