# Phase 4 Completion Guide

## ✅ All Code Ready!

All necessary files have been created and are ready to use. Follow the steps below to complete Phase 4.

---

## 📁 Files Created

### 1. Update Script
**Location**: `scripts/apply-phase4-updates.js`

This script automatically applies the new journey page updates.

**Usage**:
```bash
node scripts/apply-phase4-updates.js
```

This will:
- Backup the original `src/app/(main)/journey/new/page.tsx`
- Apply all Phase 4 updates (API integration, loading states, toast notifications)

---

### 2. Journey Detail Page (Complete Implementation)
**Location**: `src/app/(main)/journey/[id]/page_complete.tsx`

**To Use**:
```bash
# Rename to page.tsx
mv src/app/\(main\)/journey/\[id\]/page_complete.tsx src/app/\(main\)/journey/\[id\)/page.tsx
```

Or manually copy the content from `page_complete.tsx` to `page.tsx`.

**Features Included**:
- ✅ Journey header with book info
- ✅ Music player integration
- ✅ Playlist display
- ✅ Music generation status tracking
- ✅ Polling mechanism (5-second intervals, 3-minute timeout)
- ✅ Statistics sidebar
- ✅ Action buttons (add log, complete journey)
- ✅ Loading and error states

---

### 3. Journey API Route
**Location**: `src/app/api/journeys/[id]/route.ts`

**Already Created!** This file is ready to use.

**Features**:
- ✅ GET endpoint to fetch journey by ID
- ✅ Authentication check
- ✅ Join with reading_logs and music_tracks
- ✅ Returns complete journey data

---

## 🚀 Quick Start (3 Steps)

### Step 1: Run the Update Script
```bash
node scripts/apply-phase4-updates.js
```

### Step 2: Activate Journey Detail Page
```bash
# Windows (Git Bash)
mv src/app/\(main\)/journey/\[id\]/page_complete.tsx src/app/\(main\)/journey/\[id\]/page.tsx

# Or use this command
cp src/app/\(main\)/journey/\[id\]/page_complete.tsx src/app/\(main\)/journey/\[id\]/page.tsx && rm src/app/\(main\)/journey/\[id\]/page_complete.tsx
```

### Step 3: Test!
```bash
npm run dev
```

Navigate to:
1. http://localhost:3000/journey/new
2. Search for a book (e.g., "노인과 바다")
3. Select the book
4. You'll be redirected to the journey detail page

---

## 🧪 Testing Checklist

### 1. New Journey Page (`/journey/new`)
- [ ] Page loads without errors
- [ ] "도서 검색하기" button opens search dialog
- [ ] Search dialog can search for books (Google Books API)
- [ ] Selecting a book shows loading state
- [ ] Toast notification appears ("독서 여정이 시작되었습니다!")
- [ ] Redirects to `/journey/[id]`

### 2. Journey Detail Page (`/journey/[id]`)
- [ ] Page loads with mock journey data
- [ ] Journey header displays book title, author, cover
- [ ] Statistics sidebar shows reading days, music count, log count
- [ ] Music generation status appears
- [ ] Playlist displays v0 track as "pending"
- [ ] After ~30 seconds, track status changes to "completed" (mock)
- [ ] Music player appears when track is completed
- [ ] "독서 기록 추가" and "완독 처리" buttons are visible

### 3. API Routes
- [ ] `POST /api/journeys/create` creates journey successfully
- [ ] Returns journey object with ID
- [ ] `POST /api/music/generate` updates track status to "generating"
- [ ] `GET /api/music/generate?track_id=...` returns track status
- [ ] `GET /api/journeys/[id]` returns journey with logs

---

## 🔍 Troubleshooting

### Issue: "File not found" errors
**Solution**: Make sure you're in the project root directory when running scripts.

### Issue: Page doesn't redirect after book selection
**Check**:
1. Open browser console (F12)
2. Look for API errors
3. Verify `POST /api/journeys/create` returns 200 status
4. Check that `data.journey.id` exists

### Issue: Music generation doesn't start
**Check**:
1. Journey detail page console logs
2. Verify `startMusicGeneration()` is called
3. Check `POST /api/music/generate` response
4. Ensure polling interval is running

---

## 📝 Next Steps After Phase 4

Once Phase 4 is complete and tested:

### Phase 5: 독서 기록 추가 & vN 생성
1. Create `/journey/[id]/log/new` page
2. Implement `LogForm` component
3. Create `POST /api/journeys/[id]/logs` endpoint
4. Generate vN music with accumulated context

### Phase 6: 완독 & vFinal 생성
1. Create `/journey/[id]/complete` page
2. Implement `CompleteForm` component (rating, review)
3. Create `POST /api/journeys/[id]/complete` endpoint
4. Generate vFinal music

---

## 🎯 Success Criteria

Phase 4 is **complete** when:
- ✅ User can select a book and create a journey
- ✅ Journey is stored in database
- ✅ v0 music prompt is generated
- ✅ User is redirected to journey detail page
- ✅ Journey detail page loads and displays correctly
- ✅ Music generation status is tracked
- ✅ Playlist shows all tracks (even if pending)
- ✅ Error states are handled gracefully

---

## 📚 File Reference

| File | Status | Action Required |
|------|--------|-----------------|
| `scripts/apply-phase4-updates.js` | ✅ Ready | Run the script |
| `src/app/(main)/journey/new/page.tsx` | ⚠️ Update Needed | Run script to update |
| `src/app/(main)/journey/[id]/page_complete.tsx` | ✅ Ready | Rename to page.tsx |
| `src/app/api/journeys/[id]/route.ts` | ✅ Ready | No action needed |
| `src/app/api/journeys/create/route.ts` | ✅ Already Exists | No action needed |
| `src/app/api/music/generate/route.ts` | ✅ Already Exists | No action needed |

---

## 🔧 Manual Application (Alternative to Script)

If you prefer to apply changes manually:

### For `src/app/(main)/journey/new/page.tsx`:
See `docs/phase4/implementation_guide.md` for specific line-by-line changes.

### For `src/app/(main)/journey/[id]/page.tsx`:
Copy the entire content from `page_complete.tsx`.

### For `src/app/api/journeys/[id]/route.ts`:
Already created - no changes needed.

---

**Ready to complete Phase 4? Start with Step 1! 🚀**
