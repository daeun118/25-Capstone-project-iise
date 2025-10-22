'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { m } from 'framer-motion';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  categories?: FilterOption[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  sortOptions?: FilterOption[];
  selectedSort?: string;
  onSortChange?: (sort: string) => void;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function FilterBar({
  categories = [],
  selectedCategory = 'all',
  onCategoryChange,
  sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'popular', label: '인기순' },
  ],
  selectedSort = 'latest',
  onSortChange,
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = '검색...',
}: FilterBarProps) {
  const handleCategoryClick = (category: string) => {
    onCategoryChange?.(category);
  };

  const handleSortChange = (value: string) => {
    onSortChange?.(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(e.target.value);
  };

  const handleClearSearch = () => {
    onSearchChange?.('');
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="pl-10 pr-10"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Category Filters - Gradient Buttons */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => {
              const isSelected = selectedCategory === category.value;
              return (
                <m.button
                  key={category.value}
                  onClick={() => handleCategoryClick(category.value)}
                  className={
                    isSelected
                      ? 'px-5 py-2.5 rounded-xl font-semibold text-white shadow-md transition-all'
                      : 'px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-white border border-gray-200 hover:border-primary/30 transition-all'
                  }
                  style={
                    isSelected
                      ? {
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        }
                      : undefined
                  }
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ scale: isSelected ? 1.05 : 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {category.label}
                </m.button>
              );
            })}
          </div>
        )}

        {/* Sort Select - Enhanced */}
        {sortOptions.length > 0 && (
          <m.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Select value={selectedSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[140px] border-gray-200 hover:border-primary/30 transition-colors">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </m.div>
        )}
      </div>
    </div>
  );
}
