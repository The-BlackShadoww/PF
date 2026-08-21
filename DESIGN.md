# Acebuilder

## Mission
Create implementation-ready, token-driven UI guidance for Acebuilder that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- Product/brand: Acebuilder
- URL: https://www.acebuilder.ai/
- Audience: online shoppers and consumers
- Product surface: marketing site

## Style Foundations
- Visual style: structured, tokenized, content-first
- Main font style: `font.family.primary=Inter`, `font.family.stack=Inter, sans-serif`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Typography scale: `font.size.xs=8px`, `font.size.sm=9px`, `font.size.md=10px`, `font.size.lg=11px`, `font.size.xl=12px`, `font.size.2xl=13px`, `font.size.3xl=14px`, `font.size.4xl=16px`
- Color palette: `color.text.primary=#fafafa`, `color.text.secondary=lab(66.128 -0.0000298023 0.0000119209)`, `color.text.tertiary=#ffffff`, `color.text.inverse=lab(48.496 0 0)`, `color.surface.base=#000000`, `color.surface.muted=lab(15.204 0 -0.00000596046)`, `color.surface.raised=#0a0a0a`, `color.surface.strong=oklab(0.145 -0.00000143796 0.00000340492 / 0.3)`, `color.border.default=#383838`, `color.border.strong=oklab(0.268999 -0.00000260025 0.00000627339 / 0.3)`
- Spacing scale: `space.1=3px`, `space.2=4px`, `space.3=8px`, `space.4=10px`, `space.5=12px`, `space.6=14px`, `space.7=16px`, `space.8=24px`
- Radius/shadow/motion tokens: `radius.xs=6px`, `radius.sm=10px`, `radius.md=12px`, `radius.lg=16px`, `radius.xl=50px`, `radius.2xl=33554400px` | `shadow.1=rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgb(38, 103, 255) 0px 0px 0px 2px inset, oklab(0.999994 0.0000455678 0.0000200868 / 0.2) 0px 0px 0px 3px inset, rgba(255, 255, 255, 0.2) 0px 0px 10px 0px inset`, `shadow.2=rgba(0, 0, 0, 0.06) 0px 0px 0px 1px, rgba(0, 0, 0, 0.06) 0px 1px 2px -1px, rgba(0, 0, 0, 0.04) 0px 2px 4px 0px`, `shadow.3=rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgb(38, 103, 255) 0px 0px 0px 1px inset, oklab(0.999994 0.0000455678 0.0000200868 / 0.2) 0px 0px 0px 2px inset, rgba(255, 255, 255, 0.2) 0px 0px 10px 0px inset`, `shadow.4=rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.55) 0px 12px 48px -8px` | `motion.duration.instant=150ms`, `motion.duration.fast=167ms`, `motion.duration.normal=200ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: buttons (24), links (22), lists (3), navigation (2), inputs (1).


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
