# Phase 4 Implementation Guide

## File 1: src/app/(main)/journey/new/page.tsx

### Changes Needed:

1. **Add import** (line 9, after useRouter import):
```typescript
import { toast } from 'sonner';
```

2. **Add state** (line 13, after searchDialogOpen state):
```typescript
const [isCreating, setIsCreating] = useState(false);
```

3. **Replace handleBookSelect function** (lines 15-19):
```typescript
const handleBookSelect = async (book: any) => {
  setIsCreating(true);
  try {
    const response = await fetch('/api/journeys/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        book_title: book.title,
        book_author: book.authors?.join(', '),
        book_isbn: book.isbn,
        book_description: book.description,
        book_category: book.categories?.[0],
        book_cover_url: book.coverUrl,
        book_publisher: book.publisher,
        book_published_date: book.publishedDate,
      }),
    });

    const data = await response.json();

    if (data.success && data.journey) {
      toast.success('독서 여정이 시작되었습니다! v0 음악을 생성하고 있습니다.');
      router.push(`/journey/${data.journey.id}`);
    } else {
      toast.error(data.error || '독서 여정 생성에 실패했습니다.');
    }
  } catch (error) {
    console.error('Journey creation error:', error);
    toast.error('독서 여정 생성 중 오류가 발생했습니다.');
  } finally {
    setIsCreating(false);
    setSearchDialogOpen(false);
  }
};
```

4. **Update Hero Button** (lines 36-43):
```typescript
<Button
  size="lg"
  onClick={() => setSearchDialogOpen(true)}
  disabled={isCreating}
  className="mt-6 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl transition-all group disabled:opacity-50"
>
  <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
  {isCreating ? '여정 생성 중...' : '도서 검색하기'}
</Button>
```

5. **Update CTA Button** (lines 147-154):
```typescript
<Button
  size="lg"
  onClick={() => setSearchDialogOpen(true)}
  disabled={isCreating}
  className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg group disabled:opacity-50"
>
  <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
  {isCreating ? '여정 생성 중...' : '도서 검색하기'}
</Button>
```

## Summary:
- Added `toast` from 'sonner' for notifications
- Added `isCreating` state to show loading state
- Implemented full `handleBookSelect` with API call to `/api/journeys/create`
- Added loading states to buttons with `disabled` prop
- Navigate to journey detail page on success

---

Next: Implement journey detail page
