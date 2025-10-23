import { OutlineItem } from '@/types';

/**
 * Markdownテキストからアウトライン構造を抽出
 * #記号がある場合はそれを使用し、ない場合はヒューリスティックで検出
 */
export function parseOutline(content: string): OutlineItem[] {
  const lines = content.split('\n');
  const items: OutlineItem[] = [];
  
  // まず#記号付きの見出しを検出
  let hasHashHeadings = false;
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      hasHashHeadings = true;
      const level = match[1].length;
      const text = match[2].trim();
      
      items.push({
        id: `outline_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        level,
        text,
        line: index,
        collapsed: false
      });
    }
  });
  
  // #記号付きの見出しがある場合はそれを返す
  if (hasHashHeadings) {
    return items;
  }
  
  // #記号がない場合、ヒューリスティックで見出しを検出
  const headingKeywords = [
    /^第[一二三四五六七八九十\d]+章/,
    /^第[一二三四五六七八九十\d]+部/,
    /^第[一二三四五六七八九十\d]+節/,
    /^セクション[\d-]+/,
    /^サブセクション[\d-]+/,
    /^section[\d-]+/i,
    /^chapter[\d-]+/i,
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 空行はスキップ
    if (!line) continue;
    
    // キーワードマッチング
    let isHeading = false;
    let level = 1;
    
    for (const pattern of headingKeywords) {
      if (pattern.test(line)) {
        isHeading = true;
        
        // レベルを推測
        if (/^第[一二三四五六七八九十\d]+章/.test(line) || /^chapter/i.test(line)) {
          level = 1;
        } else if (/^セクション/.test(line) || /^section/i.test(line)) {
          level = 2;
        } else if (/^サブセクション/.test(line)) {
          level = 3;
        }
        
        break;
      }
    }
    
    // 見出しとして検出された場合
    if (isHeading && line.length < 100) {
      items.push({
        id: `outline_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        level,
        text: line,
        line: i,
        collapsed: false
      });
    }
  }
  
  return items;
}

/**
 * 文字数をカウント
 */
export function countCharacters(text: string): number {
  return text.length;
}

/**
 * 指定した文字列の出現回数をカウント
 */
export function countOccurrences(text: string, searchString: string): number {
  if (!searchString) return 0;
  const regex = new RegExp(searchString, 'g');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * タグパターンを検出してリンクに変換
 * 例: [[タグ名]] -> <a href="#tag:タグ名">タグ名</a>
 */
export function detectTags(text: string): string[] {
  const tagPattern = /\[\[(.+?)\]\]/g;
  const tags: string[] = [];
  let match;
  
  while ((match = tagPattern.exec(text)) !== null) {
    tags.push(match[1]);
  }
  
  // 重複を除去
  const uniqueTags = tags.filter((tag, index) => tags.indexOf(tag) === index);
  return uniqueTags;
}

/**
 * テキスト内のタグをハイライト用のマークアップに変換
 */
export function highlightTags(text: string, tags: Record<string, string>): string {
  let result = text;
  
  Object.keys(tags).forEach(tag => {
    const pattern = new RegExp(`\\[\\[${tag}\\]\\]`, 'g');
    result = result.replace(pattern, `<mark class="tag" data-tag="${tag}">${tag}</mark>`);
  });
  
  return result;
}

