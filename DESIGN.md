# Arcade

## Mission
Create implementation-ready, token-driven UI guidance for Arcade that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- Product/brand: Arcade
- URL: https://www.arcade.software/
- Audience: buyers, teams, and decision-makers
- Product surface: marketing site

## Style Foundations
- Visual style: structured, tokenized, content-first
- Main font style: `font.family.primary=Inter Variable`, `font.family.stack=Inter Variable, Arial, sans-serif`, `font.size.base=14px`, `font.weight.base=400`, `font.lineHeight.base=17.5px`
- Typography scale: `font.size.xs=14px`, `font.size.sm=16px`, `font.size.md=18px`, `font.size.lg=20px`, `font.size.xl=24px`, `font.size.2xl=32px`, `font.size.3xl=36px`, `font.size.4xl=48px`
- Color palette: `color.text.primary=#4b5563`, `color.text.secondary=#111827`, `color.text.tertiary=#6b7280`, `color.text.inverse=#333333`, `color.surface.base=#000000`, `color.surface.muted=#ffffff`, `color.surface.raised=#2142e7`, `color.surface.strong=#f3f4f6`, `color.border.strong=#e5e7eb`
- Spacing scale: `space.1=4px`, `space.2=6px`, `space.3=6.4px`, `space.4=8px`, `space.5=10px`, `space.6=16px`, `space.7=24px`, `space.8=32px`
- Radius/shadow/motion tokens: `radius.xs=12px`, `radius.sm=16px`, `radius.md=50px`, `radius.lg=72px`, `radius.xl=80px` | `shadow.1=rgba(17, 24, 39, 0.12) 0px 0px 0px 1px`, `shadow.2=rgba(17, 24, 39, 0.04) 0px 32px 32px 0px, rgba(17, 24, 39, 0.04) 0px 16px 16px 0px, rgba(17, 24, 39, 0.04) 0px 8px 8px 0px, rgba(17, 24, 39, 0.04) 0px 4px 4px -2px, rgba(17, 24, 39, 0.04) 0px 2px 2px -1px, rgba(17, 24, 39, 0.16) 0px 0px 0px 1px`, `shadow.3=rgba(17, 24, 39, 0.04) 0px 32px 32px 0px, rgba(17, 24, 39, 0.04) 0px 16px 16px 0px, rgba(17, 24, 39, 0.04) 0px 8px 8px 0px, rgba(17, 24, 39, 0.04) 0px 4px 4px -2px, rgba(17, 24, 39, 0.04) 0px 2px 2px -1px, rgb(24, 47, 165) 0px 0px 0px 1px`, `shadow.4=rgb(24, 47, 165) 0px 0px 0px 1px, rgba(17, 24, 39, 0.04) 0px 2px 2px -2px, rgba(17, 24, 39, 0.04) 0px 4px 4px 0px, rgba(17, 24, 39, 0.04) 0px 8px 8px 0px, rgba(17, 24, 39, 0.04) 0px 16px 16px 0px, rgba(17, 24, 39, 0.04) 0px 32px 32px 0px` | `motion.duration.instant=150ms`, `motion.duration.fast=167ms`, `motion.duration.normal=200ms`, `motion.duration.slow=350ms`

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
- Include known page component density: links (77), buttons (18), cards (5), inputs (3), navigation (2).


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
