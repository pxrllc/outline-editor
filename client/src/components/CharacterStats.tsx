import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { countCharacters, countOccurrences } from '@/lib/outline';
import { Search, Type } from 'lucide-react';

interface CharacterStatsProps {
  content: string;
  selectedText: string;
}

export default function CharacterStats({ content, selectedText }: CharacterStatsProps) {
  const [searchString, setSearchString] = useState('');
  const [highlightLength, setHighlightLength] = useState(400);
  
  const totalChars = countCharacters(content);
  const selectedChars = countCharacters(selectedText);
  const searchCount = searchString ? countOccurrences(content, searchString) : 0;
  
  // 指定文字数に達している箇所を検出
  const detectLongSections = () => {
    const lines = content.split('\n');
    let currentSection = '';
    let sectionStart = 0;
    const longSections: { start: number; length: number }[] = [];
    
    lines.forEach((line, index) => {
      if (line.match(/^#{1,6}\s/)) {
        // ヘッダーで区切る
        if (currentSection.length >= highlightLength) {
          longSections.push({
            start: sectionStart,
            length: currentSection.length
          });
        }
        currentSection = '';
        sectionStart = index;
      } else {
        currentSection += line;
      }
    });
    
    // 最後のセクションをチェック
    if (currentSection.length >= highlightLength) {
      longSections.push({
        start: sectionStart,
        length: currentSection.length
      });
    }
    
    return longSections;
  };
  
  const longSections = detectLongSections();
  
  return (
    <div className="p-4 space-y-4 border-t border-border bg-background">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Type className="w-4 h-4" />
          <span className="font-semibold">文字数統計</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">総文字数:</span>
            <span className="ml-2 font-mono font-semibold">{totalChars.toLocaleString()}</span>
          </div>
          
          {selectedChars > 0 && (
            <div>
              <span className="text-muted-foreground">選択:</span>
              <span className="ml-2 font-mono font-semibold">{selectedChars.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <Input
            type="text"
            placeholder="検索文字列"
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            className="flex-1 h-8 text-sm"
          />
        </div>
        
        {searchString && (
          <div className="text-sm">
            <span className="text-muted-foreground">出現回数:</span>
            <span className="ml-2 font-mono font-semibold">{searchCount}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-sm">
          <span className="text-muted-foreground">指定文字数でハイライト:</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={highlightLength}
            onChange={(e) => setHighlightLength(Number(e.target.value))}
            className="w-24 h-8 text-sm"
            min="100"
            step="100"
          />
          <span className="text-sm text-muted-foreground">文字以上</span>
        </div>
        
        {longSections.length > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">該当セクション:</span>
            <span className="ml-2 font-mono font-semibold">{longSections.length}箇所</span>
          </div>
        )}
      </div>
    </div>
  );
}

