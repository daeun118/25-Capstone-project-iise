'use client';

import { useEffect, useState } from 'react';
import { Eye, Type, AlignJustify } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

type FontSize = 'small' | 'medium' | 'large' | 'x-large';
type LineHeight = 'compact' | 'normal' | 'relaxed' | 'loose';

const FONT_SIZE_MAP = {
  small: '14px',
  medium: '16px',
  large: '18px',
  'x-large': '20px',
};

const LINE_HEIGHT_MAP = {
  compact: '1.4',
  normal: '1.6',
  relaxed: '1.8',
  loose: '2.0',
};

export function AccessibilitySettings() {
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [lineHeight, setLineHeight] = useState<LineHeight>('normal');

  useEffect(() => {
    setMounted(true);
    
    // Load saved preferences from localStorage
    const savedFontSize = localStorage.getItem('fontSize') as FontSize;
    const savedLineHeight = localStorage.getItem('lineHeight') as LineHeight;
    
    if (savedFontSize) setFontSize(savedFontSize);
    if (savedLineHeight) setLineHeight(savedLineHeight);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply font size
    document.documentElement.style.setProperty('--base-font-size', FONT_SIZE_MAP[fontSize]);
    document.documentElement.style.setProperty('--base-line-height', LINE_HEIGHT_MAP[lineHeight]);
    
    // Save to localStorage
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('lineHeight', lineHeight);
  }, [fontSize, lineHeight, mounted]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Eye className="size-5" />
        <span className="sr-only">접근성 설정</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="size-5" />
          <span className="sr-only">접근성 설정</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>접근성 설정</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Font Size */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Type className="size-4" />
            <span className="text-sm font-medium">글씨 크기</span>
          </div>
          <div className="space-y-2">
            <DropdownMenuItem 
              onClick={() => setFontSize('small')}
              className={fontSize === 'small' ? 'bg-accent' : ''}
            >
              <span className="text-sm">작게 (14px)</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setFontSize('medium')}
              className={fontSize === 'medium' ? 'bg-accent' : ''}
            >
              <span className="text-base">보통 (16px)</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setFontSize('large')}
              className={fontSize === 'large' ? 'bg-accent' : ''}
            >
              <span className="text-lg">크게 (18px)</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setFontSize('x-large')}
              className={fontSize === 'x-large' ? 'bg-accent' : ''}
            >
              <span className="text-xl">매우 크게 (20px)</span>
            </DropdownMenuItem>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Line Height */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlignJustify className="size-4" />
            <span className="text-sm font-medium">줄 간격</span>
          </div>
          <div className="space-y-2">
            <DropdownMenuItem 
              onClick={() => setLineHeight('compact')}
              className={lineHeight === 'compact' ? 'bg-accent' : ''}
            >
              <span>좁게 (1.4)</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setLineHeight('normal')}
              className={lineHeight === 'normal' ? 'bg-accent' : ''}
            >
              <span>보통 (1.6)</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setLineHeight('relaxed')}
              className={lineHeight === 'relaxed' ? 'bg-accent' : ''}
            >
              <span>넓게 (1.8)</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setLineHeight('loose')}
              className={lineHeight === 'loose' ? 'bg-accent' : ''}
            >
              <span>매우 넓게 (2.0)</span>
            </DropdownMenuItem>
          </div>
        </div>

        <DropdownMenuSeparator />
        
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              setFontSize('medium');
              setLineHeight('normal');
            }}
          >
            기본값으로 재설정
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
