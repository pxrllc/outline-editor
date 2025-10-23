// プロジェクトとドキュメントの型定義

export type ViewMode = 'outline' | 'markdown' | 'preview' | 'plain';

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  documents: Document[];
  synopsis: string; // あらすじ
  notes: string; // 資料ノート
  tags: Record<string, string>; // タグ辞書 { tagName: definition }
  createdAt: number;
  updatedAt: number;
}

export interface OutlineItem {
  id: string;
  level: number; // 1-6 (h1-h6)
  text: string;
  line: number; // エディタ内の行番号
  collapsed: boolean;
}

export interface EditorState {
  currentProject: Project | null;
  currentDocumentId: string | null;
  viewMode: ViewMode;
  outlineItems: OutlineItem[];
  selectedText: string;
  cursorPosition: number;
}

