import { OutlineItem } from '@/types';

/**
 * Markdownテキストからアウトライン構造を抽出
 */
export function parseOutline(content: string): OutlineItem[] {
  const lines = content.split('\n');
  const items: OutlineItem[] = [];
  
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
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

