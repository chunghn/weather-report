# Content Collision Analysis

## Summary

Analysis of content collisions between:

- `vercel-composition-patterns`
- `vercel-react-best-practices`
- `web-design-guidelines`

And other skills in `.cursor/skills/`.

## Findings

### ✅ No Critical Conflicts

All skills complement each other rather than conflict. However, there are **overlapping topics** that should be understood:

---

## 1. vercel-composition-patterns vs frontend-patterns

### Overlap: Compound Components

**vercel-composition-patterns:**

- Focus: **Avoiding boolean prop proliferation** through compound components
- Approach: Context-based composition with dependency injection
- Priority: HIGH (architecture-level)
- Specificity: Very detailed rules with examples

**frontend-patterns:**

- Focus: General React patterns including compound components
- Approach: Basic compound component example with Context
- Priority: General patterns
- Specificity: General examples

### Analysis

**No conflict** - These are complementary:

- `vercel-composition-patterns` provides **deep, specific guidance** on when and how to use compound components to avoid boolean props
- `frontend-patterns` provides **general examples** of compound components as one pattern among many

**Recommendation:**

- Use `vercel-composition-patterns` when refactoring components with many boolean props
- Use `frontend-patterns` for general React pattern reference

### Overlap: Render Props vs Children

**vercel-composition-patterns:**

- Rule: `patterns-children-over-render-props.md`
- Guidance: Prefer children over render props for composition
- Exception: Render props OK when parent needs to pass data back

**frontend-patterns:**

- Shows render props pattern as valid option
- No guidance on when to prefer one over the other

### Analysis

**Minor difference in emphasis:**

- `vercel-composition-patterns` explicitly recommends children over render props
- `frontend-patterns` shows both as valid patterns

**No conflict** - Both acknowledge render props as valid, but `vercel-composition-patterns` provides clearer guidance on preference.

---

## 2. vercel-react-best-practices vs frontend-patterns

### Overlap: Performance Optimization

**vercel-react-best-practices:**

- 57 detailed rules across 8 categories
- Prioritized by impact (CRITICAL → LOW)
- Specific rules like `rerender-memo.md`, `bundle-dynamic-imports.md`
- Very detailed with incorrect/correct examples

**frontend-patterns:**

- General performance patterns
- Memoization, lazy loading, virtualization
- Less detailed, more general examples

### Analysis

**No conflict** - Different levels of detail:

- `vercel-react-best-practices` = **Comprehensive, prioritized performance guide** (57 rules)
- `frontend-patterns` = **General patterns reference** (broader scope)

**Recommendation:**

- Use `vercel-react-best-practices` for performance optimization tasks
- Use `frontend-patterns` for general React patterns

### Overlap: Memoization

**vercel-react-best-practices:**

- `rerender-memo.md`: Extract to memoized components for early returns
- `rerender-memo-with-default-value.md`: Hoist default non-primitive props
- `rerender-simple-expression-in-memo.md`: Avoid memo for simple primitives
- Mentions React Compiler makes manual memoization unnecessary

**frontend-patterns:**

- General memoization examples (useMemo, useCallback, React.memo)
- No guidance on when NOT to memoize

**coding-standards:**

- General memoization best practices
- No specific rules about when to use/avoid

### Analysis

**No conflict** - Different levels of specificity:

- `vercel-react-best-practices` = **Detailed, nuanced guidance** with anti-patterns
- `frontend-patterns` = **Basic examples**
- `coding-standards` = **General best practices**

### Overlap: Dynamic Imports / Lazy Loading

**vercel-react-best-practices:**

- `bundle-dynamic-imports.md`: Use `next/dynamic` for heavy components
- Specific guidance on when to use (not needed on initial render)
- Shows incorrect vs correct examples

**frontend-patterns:**

- General lazy loading with `lazy()` and `Suspense`
- Shows code splitting pattern

**coding-standards:**

- General lazy loading best practice

### Analysis

**No conflict** - Different contexts:

- `vercel-react-best-practices` = **Next.js specific** (`next/dynamic`)
- `frontend-patterns` = **React general** (`lazy()` + `Suspense`)
- `coding-standards` = **General best practice**

---

## 3. vercel-react-best-practices vs coding-standards

### Overlap: React Best Practices

**vercel-react-best-practices:**

- 57 specific, prioritized rules
- Performance-focused
- Detailed incorrect/correct examples
- Next.js specific guidance

**coding-standards:**

- General React best practices
- Component structure, hooks, state management
- Broader scope (TypeScript, JavaScript, API design, etc.)

### Analysis

**No conflict** - Different scopes:

- `vercel-react-best-practices` = **Performance optimization specialist** (57 detailed rules)
- `coding-standards` = **General coding standards** (broader, less detailed)

**Recommendation:**

- Use `vercel-react-best-practices` for React/Next.js performance tasks
- Use `coding-standards` for general code quality and structure

### Overlap: State Management

**vercel-react-best-practices:**

- `rerender-derived-state.md`: Subscribe to derived booleans, not raw values
- `rerender-derived-state-no-effect.md`: Derive state during render, not effects
- `rerender-functional-setstate.md`: Use functional setState
- Performance-focused state patterns

**coding-standards:**

- General state management patterns
- Functional setState example
- Context + Reducer pattern (not in vercel-react-best-practices)

**frontend-patterns:**

- Context + Reducer pattern example
- Custom hooks for state

### Analysis

**No conflict** - Different focuses:

- `vercel-react-best-practices` = **Performance-optimized state patterns**
- `coding-standards` = **General state management patterns**
- `frontend-patterns` = **Pattern examples**

---

## 4. web-design-guidelines

### Overlap Check

**web-design-guidelines:**

- Focus: UI/UX guidelines compliance
- Purpose: Review code against Web Interface Guidelines
- Scope: Design, accessibility, UX patterns
- Source: External guidelines from Vercel Labs

**Other skills:**

- `frontend-patterns` has accessibility patterns (keyboard navigation, focus management)
- `coding-standards` has general code quality

### Analysis

**No conflict** - Different domains:

- `web-design-guidelines` = **Design/UX compliance** (external standards)
- `frontend-patterns` = **Technical accessibility implementation**
- `coding-standards` = **Code quality**

**Recommendation:**

- Use `web-design-guidelines` for design/UX audits
- Use `frontend-patterns` for accessibility implementation patterns

---

## Summary Table

| Skill                         | Primary Focus                               | Overlaps With                           | Conflict Level                    |
| ----------------------------- | ------------------------------------------- | --------------------------------------- | --------------------------------- |
| `vercel-composition-patterns` | Compound components, avoiding boolean props | `frontend-patterns`                     | ✅ None - Complementary           |
| `vercel-react-best-practices` | React/Next.js performance (57 rules)        | `frontend-patterns`, `coding-standards` | ✅ None - Different detail levels |
| `web-design-guidelines`       | UI/UX compliance                            | `frontend-patterns` (accessibility)     | ✅ None - Different domains       |

---

## Recommendations

### 1. Skill Selection Priority

When multiple skills could apply:

1. **For React composition/architecture:**
   - Use `vercel-composition-patterns` for specific refactoring tasks
   - Use `frontend-patterns` for general pattern reference

2. **For React performance:**
   - Use `vercel-react-best-practices` for optimization tasks
   - Use `frontend-patterns` for general patterns
   - Use `coding-standards` for code quality

3. **For UI/UX:**
   - Use `web-design-guidelines` for design compliance
   - Use `frontend-patterns` for accessibility implementation

### 2. No Conflicts Found

✅ All skills complement each other
✅ Different levels of detail/specificity
✅ Different scopes (general vs specific)
✅ No contradictory advice

### 3. Potential Improvements

Consider adding skill descriptions that clarify:

- When to use each skill
- How skills relate to each other
- Priority/scope differences

---

## Conclusion

**No content collisions found.** The three Vercel skills (`vercel-composition-patterns`, `vercel-react-best-practices`, `web-design-guidelines`) complement existing skills rather than conflict with them. They provide:

- **More specific guidance** than general skills
- **Prioritized rules** for optimization
- **Detailed examples** with incorrect/correct patterns

The overlapping topics are handled at different levels of detail and specificity, making them complementary rather than conflicting.
