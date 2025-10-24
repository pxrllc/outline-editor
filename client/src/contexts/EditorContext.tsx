import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Project, Document, ViewMode, OutlineItem, EditorState } from '@/types';

interface EditorContextType extends EditorState {
  setCurrentProject: (project: Project | null) => void;
  setCurrentDocumentId: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setOutlineItems: (items: OutlineItem[]) => void;
  setSelectedText: (text: string) => void;
  setCursorPosition: (position: number) => void;
  updateDocumentContent: (content: string) => void;
  updateDocumentTitle: (title: string) => void;
  getCurrentDocument: () => Document | null;
  createNewDocument: (title: string) => Document;
  deleteDocument: (documentId: string) => void;
  createNewProject: (name: string) => Project;
  saveProject: (name?: string) => void;
  loadProject: (id: string) => void;
  autoSave: () => void;
  updateProjectSynopsis: (synopsis: string) => void;
  updateProjectNotes: (notes: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('markdown');
  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  // 現在のドキュメントを取得
  const getCurrentDocument = useCallback((): Document | null => {
    if (!currentProject || !currentDocumentId) return null;
    return currentProject.documents.find(doc => doc.id === currentDocumentId) || null;
  }, [currentProject, currentDocumentId]);

  // ドキュメントの内容を更新
  const updateDocumentContent = useCallback((content: string) => {
    if (!currentProject || !currentDocumentId) return;
    
    // 現在のドキュメントを取得
    const currentDoc = currentProject.documents.find(doc => doc.id === currentDocumentId);
    if (!currentDoc) return;
    
    // 内容が変更されていない場合は何もしない
    if (currentDoc.content === content) return;
    
    const updatedDocuments = currentProject.documents.map(doc => 
      doc.id === currentDocumentId 
        ? { ...doc, content, updatedAt: Date.now() }
        : doc
    );
    
    setCurrentProject({
      ...currentProject,
      documents: updatedDocuments,
      updatedAt: Date.now()
    });
  }, [currentProject, currentDocumentId]);

  // ドキュメントのタイトルを更新
  const updateDocumentTitle = useCallback((title: string) => {
    if (!currentProject || !currentDocumentId) return;
    
    // 現在のドキュメントを取得
    const currentDoc = currentProject.documents.find(doc => doc.id === currentDocumentId);
    if (!currentDoc) return;
    
    // タイトルが変更されていない場合は何もしない
    if (currentDoc.title === title) return;
    
    const updatedDocuments = currentProject.documents.map(doc => 
      doc.id === currentDocumentId 
        ? { ...doc, title, updatedAt: Date.now() }
        : doc
    );
    
    setCurrentProject({
      ...currentProject,
      documents: updatedDocuments,
      updatedAt: Date.now()
    });
  }, [currentProject, currentDocumentId]);

  // 新しいドキュメントを作成
  const createNewDocument = useCallback((title: string): Document => {
    const newDoc: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    if (currentProject) {
      setCurrentProject({
        ...currentProject,
        documents: [...currentProject.documents, newDoc],
        updatedAt: Date.now()
      });
    }
    
    return newDoc;
  }, [currentProject]);

  // ドキュメントを削除
  const deleteDocument = useCallback((documentId: string) => {
    if (!currentProject) return;
    
    const updatedDocuments = currentProject.documents.filter(doc => doc.id !== documentId);
    
    setCurrentProject({
      ...currentProject,
      documents: updatedDocuments,
      updatedAt: Date.now()
    });
    
    // 削除したドキュメントが現在選択中の場合、別のドキュメントを選択
    if (currentDocumentId === documentId) {
      if (updatedDocuments.length > 0) {
        setCurrentDocumentId(updatedDocuments[0].id);
      } else {
        setCurrentDocumentId(null);
      }
    }
  }, [currentProject, currentDocumentId]);

  // 新しいプロジェクトを作成
  const createNewProject = useCallback((name: string): Project => {
    const newProject: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      documents: [],
      synopsis: '',
      notes: '',
      tags: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // 初期ドキュメントを作成
    const initialDoc: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '新規ドキュメント',
      content: '# 新規ドキュメント\n\nここから書き始めましょう。',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    newProject.documents.push(initialDoc);
    setCurrentProject(newProject);
    setCurrentDocumentId(initialDoc.id);
    
    return newProject;
  }, []);

  // プロジェクトを保存（名前付き保存）
  const saveProject = useCallback((name?: string) => {
    if (!currentProject) return;
    
    const projectToSave = name 
      ? { ...currentProject, name, updatedAt: Date.now() }
      : currentProject;
    
    // localStorageに保存
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const existingIndex = savedProjects.findIndex((p: Project) => p.id === projectToSave.id);
    
    if (existingIndex >= 0) {
      savedProjects[existingIndex] = projectToSave;
    } else {
      savedProjects.push(projectToSave);
    }
    
    localStorage.setItem('projects', JSON.stringify(savedProjects));
    
    if (name) {
      setCurrentProject(projectToSave);
    }
  }, [currentProject]);

  // プロジェクトを読み込み
  const loadProject = useCallback((id: string) => {
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = savedProjects.find((p: Project) => p.id === id);
    
    if (project) {
      setCurrentProject(project);
      if (project.documents.length > 0) {
        setCurrentDocumentId(project.documents[0].id);
      }
    }
  }, []);

  // プロジェクトのあらすじを更新
  const updateProjectSynopsis = useCallback((synopsis: string) => {
    if (!currentProject) return;
    
    setCurrentProject({
      ...currentProject,
      synopsis,
      updatedAt: Date.now()
    });
  }, [currentProject]);

  // プロジェクトの資料ノートを更新
  const updateProjectNotes = useCallback((notes: string) => {
    if (!currentProject) return;
    
    setCurrentProject({
      ...currentProject,
      notes,
      updatedAt: Date.now()
    });
  }, [currentProject]);

  // 自動保存
  const autoSave = useCallback(() => {
    if (currentProject) {
      saveProject();
    }
  }, [currentProject, saveProject]);

  // 自動保存タイマー（30秒ごと）
  useEffect(() => {
    const timer = setInterval(() => {
      autoSave();
    }, 30000);
    
    return () => clearInterval(timer);
  }, [autoSave]);

  // 初回読み込み時に最後のプロジェクトを復元
  useEffect(() => {
    const lastProjectId = localStorage.getItem('lastProjectId');
    if (lastProjectId) {
      const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      const project = savedProjects.find((p: Project) => p.id === lastProjectId);
      
      if (project) {
        setCurrentProject(project);
        if (project.documents.length > 0) {
          setCurrentDocumentId(project.documents[0].id);
        }
      } else {
        // プロジェクトが見つからない場合は新規作成
        const newProject = createInitialProject();
        setCurrentProject(newProject);
        setCurrentDocumentId(newProject.documents[0].id);
      }
    } else {
      // プロジェクトがない場合は新規作成
      const newProject = createInitialProject();
      setCurrentProject(newProject);
      setCurrentDocumentId(newProject.documents[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 初期プロジェクトを作成するヘルパー関数
  const createInitialProject = (): Project => {
    const initialDoc: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '新規ドキュメント',
      content: '# 新規ドキュメント\n\nここから書き始めましょう。',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    return {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '新規プロジェクト',
      documents: [initialDoc],
      synopsis: '',
      notes: '',
      tags: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  };

  // 現在のプロジェクトIDを保存
  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('lastProjectId', currentProject.id);
    }
  }, [currentProject]);

  // currentProjectの変更を監視してdebounce付きで自動保存
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // 既存のタイマーをクリア
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // currentProjectが変更されてから1秒後に保存
    if (currentProject) {
      saveTimeoutRef.current = setTimeout(() => {
        saveProject();
      }, 1000);
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentProject, saveProject]);

  const value: EditorContextType = {
    currentProject,
    currentDocumentId,
    viewMode,
    outlineItems,
    selectedText,
    cursorPosition,
    setCurrentProject,
    setCurrentDocumentId,
    setViewMode,
    setOutlineItems,
    setSelectedText,
    setCursorPosition,
    updateDocumentContent,
    updateDocumentTitle,
    getCurrentDocument,
    createNewDocument,
    deleteDocument,
    createNewProject,
    saveProject,
    loadProject,
    autoSave,
    updateProjectSynopsis,
    updateProjectNotes
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}

