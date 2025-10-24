import { OutlineItem } from '@/types';

/**
 * Markdownドキュメントのセクションを表す型
 */
interface MarkdownSection {
  startLine: number;
  endLine: number;
  level: number;
  heading: string;
  content: string[];
}

/**
 * Markdownドキュメントをセクションに分割
 */
export function parseMarkdownSections(content: string): MarkdownSection[] {
  const lines = content.split('\n');
  const sections: MarkdownSection[] = [];
  let currentSection: MarkdownSection | null = null;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      // 前のセクションを保存
      if (currentSection !== null) {
        currentSection.endLine = index - 1;
        sections.push(currentSection);
      }
      
      // 新しいセクションを開始
      currentSection = {
        startLine: index,
        endLine: index,
        level: headingMatch[1].length,
        heading: headingMatch[2],
        content: [line]
      };
    } else if (currentSection !== null) {
      // 現在のセクションにコンテンツを追加
      currentSection.content.push(line);
    } else {
      // ドキュメントの先頭部分（見出しより前）
      if (sections.length === 0) {
        sections.push({
          startLine: 0,
          endLine: index,
          level: 0,
          heading: '',
          content: [line]
        });
      } else {
        const firstSection = sections[0];
        firstSection.content.push(line);
        firstSection.endLine = index;
      }
    }
  }

  // 最後のセクションを保存
  if (currentSection !== null) {
    currentSection.endLine = lines.length - 1;
    sections.push(currentSection);
  }

  return sections;
}

/**
 * アウトライン項目の並び替えに基づいてMarkdownを再構築
 */
export function reorderMarkdownByOutline(
  content: string,
  oldOutline: OutlineItem[],
  newOutline: OutlineItem[]
): string {
  console.log('=== reorderMarkdownByOutline called ===');
  console.log('Content type:', typeof content);
  console.log('Content length:', content.length);
  console.log('Content preview (first 200 chars):', content.substring(0, 200));
  
  // #記号付きの見出しがない場合は、並び替えをサポートしない
  // （元のコンテンツをそのまま返す）
  const lines = content.split('\n');
  console.log('Lines count:', lines.length);
  console.log('First 5 lines:', lines.slice(0, 5));
  
  const hasHashHeadings = lines.some(line => {
    const matches = /^#{1,6}\s+/.test(line);
    if (matches) {
      console.log('Found hash heading:', line);
    }
    return matches;
  });
  
  console.log('hasHashHeadings:', hasHashHeadings);
  
  if (!hasHashHeadings) {
    console.warn('reorderMarkdownByOutline: No hash headings found, returning original content');
    return content;
  }
  
  const sections = parseMarkdownSections(content);
  
  console.log('Sections found:', sections.length);
  console.log('Sections:', sections.map(s => ({ level: s.level, heading: s.heading })));
  console.log('New outline:', newOutline.map(i => ({ level: i.level, text: i.text })));
  
  // セクションとその子セクションを取得
  const getSectionWithChildren = (section: MarkdownSection): string[] => {
    const result: string[] = [];
    const sectionIndex = sections.indexOf(section);
    
    if (sectionIndex === -1) return [];
    
    // このセクションを追加
    result.push(...section.content);
    
    // 次のセクションが子セクション（より深いレベル）なら追加
    let i = sectionIndex + 1;
    while (i < sections.length && sections[i].level > section.level) {
      result.push(...sections[i].content);
      i++;
    }
    
    return result;
  };
  
  // 新しい順序でセクションを再構築
  const newLines: string[] = [];
  const processedSections = new Set<MarkdownSection>();
  
  // ドキュメントの先頭部分（最初の見出しより前）を保持
  const firstHeadingSection = sections.find(s => s.level > 0);
  if (firstHeadingSection && firstHeadingSection.startLine > 0) {
    for (let i = 0; i < firstHeadingSection.startLine; i++) {
      newLines.push(lines[i]);
    }
  }
  
  // トップレベルの項目のみを抽出（親を持たない項目）
  const getTopLevelItems = (items: OutlineItem[]): OutlineItem[] => {
    const topLevel: OutlineItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // 前の項目がこの項目の親でないかチェック
      let isTopLevel = true;
      for (let j = i - 1; j >= 0; j--) {
        if (items[j].level < item.level) {
          // 親が見つかった
          isTopLevel = false;
          break;
        }
      }
      if (isTopLevel) {
        topLevel.push(item);
      }
    }
    return topLevel;
  };
  
  const topLevelItems = getTopLevelItems(newOutline);
  console.log('Top level items:', topLevelItems.map(i => ({ level: i.level, text: i.text })));
  
  // 新しい順序でセクションを追加（トップレベルのみ）
  let foundAnySection = false;
  topLevelItems.forEach(item => {
    // テキストとレベルでセクションを検索
    const section = sections.find(s => 
      s.heading === item.text && 
      s.level === item.level &&
      !processedSections.has(s)
    );
    
    if (section) {
      foundAnySection = true;
      const sectionLines = getSectionWithChildren(section);
      if (sectionLines.length > 0) {
        newLines.push(...sectionLines);
      }
      
      // このセクションとその子セクションを処理済みとしてマーク
      processedSections.add(section);
      const sectionIndex = sections.indexOf(section);
      let i = sectionIndex + 1;
      while (i < sections.length && sections[i].level > section.level) {
        processedSections.add(sections[i]);
        i++;
      }
    } else {
      console.warn(`Section not found: "${item.text}" (level ${item.level})`);
    }
  });
  
  // セクションが1つも見つからなかった場合は、元のコンテンツを返す
  if (!foundAnySection) {
    console.warn('reorderMarkdownByOutline: No sections matched, returning original content');
    return content;
  }
  
  console.log('New lines count:', newLines.length);
  console.log('Original lines count:', lines.length);
  
  return newLines.join('\n');
}

/**
 * アウトライン項目のインデントレベル変更をMarkdownに反映
 */
export function changeHeadingLevel(
  content: string,
  lineNumber: number,
  oldLevel: number,
  newLevel: number,
  includeChildren: boolean = false
): string {
  const lines = content.split('\n');
  const levelDiff = newLevel - oldLevel;
  
  if (!includeChildren) {
    // その行だけを変更
    const line = lines[lineNumber];
    const match = line.match(/^#{1,6}\s+(.+)$/);
    if (match) {
      lines[lineNumber] = '#'.repeat(newLevel) + ' ' + match[1];
    }
  } else {
    // 子要素も含めて変更
    const sections = parseMarkdownSections(content);
    const targetSection = sections.find(s => s.startLine === lineNumber);
    
    if (targetSection) {
      // このセクションとその子セクションのレベルを変更
      for (let i = lineNumber; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        
        if (match) {
          const currentLevel = match[1].length;
          
          // 最初のセクションまたはその子セクション
          if (i === lineNumber || currentLevel > oldLevel) {
            const newLineLevel = Math.max(1, Math.min(6, currentLevel + levelDiff));
            lines[i] = '#'.repeat(newLineLevel) + ' ' + match[2];
            
            // 子セクションでなくなったら終了
            if (i > lineNumber && currentLevel <= oldLevel) {
              break;
            }
          } else {
            // 同じレベルまたは浅いレベルの見出しが来たら終了
            break;
          }
        }
      }
    }
  }
  
  return lines.join('\n');
}

/**
 * セクション全体（見出しとその配下のコンテンツ）を取得
 */
export function getSectionContent(content: string, headingLine: number): string[] {
  const lines = content.split('\n');
  const sections = parseMarkdownSections(content);
  const section = sections.find(s => s.startLine === headingLine);
  
  if (!section) return [];
  
  const result: string[] = [...section.content];
  
  // 子セクションも含める
  const sectionIndex = sections.indexOf(section);
  for (let i = sectionIndex + 1; i < sections.length; i++) {
    if (sections[i].level <= section.level) {
      break;
    }
    result.push(...sections[i].content);
  }
  
  return result;
}

