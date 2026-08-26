# Graph Report - .  (2026-07-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 236 nodes · 480 edges · 14 communities (10 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `81e7dd07`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- database.types.ts
- compilerOptions
- page.tsx
- createClient
- devDependencies
- dependencies
- createClient
- formatCurrency
- cart-context.tsx
- icons.tsx
- proxy.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 39 edges
2. `formatCurrency()` - 24 edges
3. `compilerOptions` - 16 edges
4. `cn()` - 14 edges
5. `createClient()` - 13 edges
6. `ProductCategory` - 11 edges
7. `formatDate()` - 11 edges
8. `Product` - 10 edges
9. `Header()` - 9 edges
10. `StatusBadge()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `EditCategoryPage()` --calls--> `createClient()`  [EXTRACTED]
  app/admin/(protected)/categorias/[id]/page.tsx → lib/supabase/server.ts
- `AdminProtectedLayout()` --calls--> `createClient()`  [EXTRACTED]
  app/admin/(protected)/layout.tsx → lib/supabase/server.ts
- `AdminLoginPage()` --calls--> `createClient()`  [EXTRACTED]
  app/admin/login/page.tsx → lib/supabase/client.ts
- `Home()` --calls--> `createClient()`  [EXTRACTED]
  app/page.tsx → lib/supabase/server.ts
- `ProductDetailPage()` --calls--> `createClient()`  [EXTRACTED]
  app/productos/[slug]/page.tsx → lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (14 total, 4 thin omitted)

### Community 0 - "database.types.ts"
Cohesion: 0.12
Nodes (23): EVENT_LABELS, QuoteRow, AdminLeadsPage(), AdminDashboardPage(), ProductsPage(), STATUS_LABELS, STATUS_STYLES, StatusBadge() (+15 more)

### Community 1 - "compilerOptions"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 2 - "page.tsx"
Cohesion: 0.16
Nodes (17): AdminLoginPage(), CartPage(), Home(), KIND_META, KIND_LABELS, ProductDetailPage(), ProductCard(), ProductConfigurator() (+9 more)

### Community 3 - "createClient"
Cohesion: 0.14
Nodes (18): AdminCategoriesPage(), KIND_LABELS, EditProductPage(), NewProductPage(), AdminProductsPage(), POST(), itemSchema, POST() (+10 more)

### Community 4 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+17 more)

### Community 5 - "dependencies"
Cohesion: 0.09
Nodes (23): clsx, date-fns, lucide-react, next, dependencies, clsx, date-fns, lucide-react (+15 more)

### Community 6 - "createClient"
Cohesion: 0.19
Nodes (9): EditCategoryPage(), AdminProtectedLayout(), CategoryForm(), slugify(), QuoteActionsPanel(), LINKS, Sidebar(), QuoteActions() (+1 more)

### Community 7 - "formatCurrency"
Cohesion: 0.21
Nodes (12): QuoteDetailPage(), AdminQuotesPage(), LeadDetailPage(), PublicQuote, PublicQuoteItem, PublicQuotePage(), buildQuoteEmailHtml(), itemRow() (+4 more)

### Community 8 - "cart-context.tsx"
Cohesion: 0.25
Nodes (6): inter, metadata, CartContext, CartContextValue, CartItem, CartProvider()

### Community 10 - "proxy.ts"
Cohesion: 0.60
Nodes (3): updateSession(), config, proxy()

## Knowledge Gaps
- **83 isolated node(s):** `KIND_LABELS`, `EVENT_LABELS`, `QuoteRow`, `itemSchema`, `submitSchema` (+78 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `createClient` to `database.types.ts`, `page.tsx`, `createClient`, `formatCurrency`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `formatCurrency()` connect `formatCurrency` to `database.types.ts`, `page.tsx`, `createClient`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `KIND_LABELS`, `EVENT_LABELS`, `QuoteRow` to the rest of the system?**
  _83 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `database.types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `createClient` be split into smaller, more focused modules?**
  _Cohesion score 0.1354679802955665 - nodes in this community are weakly interconnected._