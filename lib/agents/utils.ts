export const NEXTJS_CONVENTIONS = `
## Next.js 15 App Router Official Conventions:

### Special Files (must follow exactly):
- page.tsx - Required for public routes
- layout.tsx - Shared UI wrapper
- loading.tsx - Suspense fallback
- error.tsx - Error boundary
- not-found.tsx - 404 UI
- route.ts - API endpoints (only in app/api/)
- template.tsx - Recreated on navigation

### Valid File Path Patterns:
✅ app/page.tsx
✅ app/todos/page.tsx  
✅ app/todos/[id]/page.tsx
✅ app/(dashboard)/layout.tsx
✅ app/api/todos/route.ts
✅ components/TodoItem.tsx
✅ lib/db.ts

❌ pages/todos.js (old Pages Router)
❌ src/pages/api (wrong for App Router)
❌ app/todos.tsx (missing folder)

### Parallel Execution Batches:
- Independent files can be created together
- Files with imports must wait for dependencies
- Max 5 files per batch recommended
`;
