Enhanced Production Development Guidelines
Core Principles
IMPORTANT: All code MUST follow SOLID design principles and the specific practices outlined below. These rules ensure maintainability, safety, and developer velocity.
MUST rules are enforced by CI; SHOULD rules are strongly recommended.

1 — Before Coding

BP-1 (MUST) Ask clarifying questions before starting any implementation
BP-2 (SHOULD) Draft and confirm an approach for complex work
BP-3 (SHOULD) If ≥ 2 approaches exist, list clear pros and cons
BP-4 (MUST) Create and checkout a feature branch named feature-[brief-description]


2 — While Coding
Test-Driven Development

C-1 (MUST) Follow TDD cycle: scaffold stub → write failing test → implement
C-2 (MUST) Write comprehensive tests for all new functionality

Code Quality

C-3 (MUST) Use TypeScript for all code with strict type checking
C-4 (MUST) Name functions with existing domain vocabulary for consistency
C-5 (SHOULD NOT) Introduce classes when small testable functions suffice
C-6 (SHOULD) Prefer simple, composable, testable functions
C-7 (MUST) Prefer branded types for IDs
tstype UserId = Brand<string, 'UserId'>   // ✅ Good
type UserId = string                    // ❌ Bad

C-8 (MUST) Use import type { … } for type-only imports
C-9 (SHOULD NOT) Add comments except for critical caveats; rely on self-explanatory code
C-10 (SHOULD) Default to type; use interface only when more readable or interface merging is required
C-11 (SHOULD NOT) Extract a new function unless it will be reused elsewhere, is the only way to unit-test otherwise untestable logic, or drastically improves readability of an opaque block

Styling

C-12 (MUST) Use Tailwind utilities; custom CSS only when necessary
C-13 (MUST) Follow existing component structure patterns


3 — Testing
Test Organization

T-1 (MUST) For simple functions, colocate unit tests in *.spec.ts in same directory as source file
T-2 (MUST) For API changes, add/extend integration tests in appropriate test directories
T-3 (MUST) ALWAYS separate pure-logic unit tests from DB-touching integration tests
T-4 (SHOULD) Prefer integration tests over heavy mocking
T-5 (SHOULD) Unit-test complex algorithms thoroughly

Test Quality

T-6 (SHOULD) Test the entire structure in one assertion if possible
tsexpect(result).toBe([value]) // ✅ Good

expect(result).toHaveLength(1); // ❌ Bad
expect(result[0]).toBe(value);  // ❌ Bad

T-7 (MUST) Parameterize inputs; never embed unexplained literals like 42 or "foo"
T-8 (MUST) Only add tests that can fail for real defects (no trivial asserts)
T-9 (SHOULD) Test description should state exactly what the final expect verifies
T-10 (SHOULD) Compare to independent, pre-computed expectations, never to function output re-used as oracle
T-11 (SHOULD) Express invariants/axioms (commutativity, idempotence, round-trip) using property-based testing with fast-check:
tsimport fc from 'fast-check';
import { describe, expect, test } from 'vitest';

describe('properties', () => {
  test('concatenation functoriality', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        (a, b) =>
          getCharacterCount(a + b) ===
          getCharacterCount(a) + getCharacterCount(b)
      )
    );
  });
});

T-12 (SHOULD) Use strong assertions over weak ones: expect(x).toEqual(1) not expect(x).toBeGreaterThanOrEqual(1)
T-13 (SHOULD) Test edge cases, realistic input, unexpected input, and value boundaries
T-14 (SHOULD NOT) Test conditions caught by the type checker


4 — Database

D-1 (MUST) Use Prisma schema definitions for all database operations
D-2 (MUST) Type DB helpers as Database | Transaction<Database> (or KyselyDatabase | Transaction<Database> for Kysely) so they work for both transactions and DB instances
D-3 (SHOULD) Override incorrect generated types in a dedicated override file (e.g., db-types.override.ts)


5 — Code Organization
File Structure

O-1 (MUST) Place code in shared directories only if used by ≥ 2 packages/modules
O-2 (MUST) Follow established patterns:

Components: /src/components/[feature]/[ComponentName].tsx
Pages: /src/pages/[route].tsx or /src/app/[route]/page.tsx
Utilities: /src/lib/[category]/[utility].ts
Types: /src/types/[domain].ts
API routes: Follow RESTful conventions



Architecture

Frontend: Next.js 14+ with TypeScript and Tailwind CSS
State Management: Zustand for client state, React Query for server state
Backend: Node.js with Express/Fastify and Prisma ORM
Database: PostgreSQL
Testing: Jest/Vitest for unit tests, Playwright for E2E
API Schema: TypeBox or Zod for API contract validation


6 — Quality Gates

G-1 (MUST) prettier --check passes
G-2 (MUST) eslint passes without errors
G-3 (MUST) tsc --noEmit (TypeScript) passes without warnings
G-4 (MUST) All tests pass
G-5 (MUST) Test coverage remains above 80%
G-6 (MUST) All code compiles without warnings


7 — Git Workflow

GH-1 (MUST) Use Conventional Commits format: https://www.conventionalcommits.org/en/v1.0.0
<type>[optional scope]: <description>
[optional body]
[optional footer(s)]

GH-2 (MUST) Use appropriate commit types:

feat: new feature (MINOR version)
fix: bug fix (PATCH version)
BREAKING CHANGE: or ! for breaking changes (MAJOR version)
build:, chore:, ci:, docs:, style:, refactor:, perf:, test:


GH-3 (SHOULD NOT) Refer to AI tools or assistants in commit messages
GH-4 (MUST) Commit all changes to feature branch before merging
GH-5 (MUST) Write detailed commit messages explaining changes and rationale


Developer Velocity Shortcuts
QNEW
When I type "qnew", this means:
Understand all BEST PRACTICES listed in these guidelines.
Your code SHOULD ALWAYS follow these best practices.
QPLAN
When I type "qplan", this means:
Analyze similar parts of the codebase and determine whether your plan:
- is consistent with rest of codebase
- introduces minimal changes
- reuses existing code
QCODE
When I type "qcode", this means:
Implement your plan and make sure your new tests pass.
Always run tests to make sure you didn't break anything else.
Always run `prettier` on the newly created files to ensure standard formatting.
Always run `turbo typecheck lint` or equivalent to make sure type checking and linting passes.
QCHECK
When I type "qcheck", this means:
You are a SKEPTICAL senior software engineer.
Perform this analysis for every MAJOR code change you introduced (skip minor changes):

1. Function Quality Checklist (see below)
2. Test Quality Checklist (see below)
3. Implementation Best Practices checklist
QCHECKF
When I type "qcheckf", this means:
You are a SKEPTICAL senior software engineer.
Perform the Function Quality Checklist for every MAJOR function you added or edited (skip minor changes).
QCHECKT
When I type "qcheckt", this means:
You are a SKEPTICAL senior software engineer.
Perform the Test Quality Checklist for every MAJOR test you added or edited (skip minor changes).
QUX
When I type "qux", this means:
Imagine you are a human UX tester of the feature you implemented. 
Output a comprehensive list of scenarios you would test, sorted by highest priority.
QGIT
When I type "qgit", this means:
Add all changes to staging, create a commit, and push to remote.
Follow the Git Workflow checklist (GH-1 through GH-5) for writing your commit message.

Function Quality Checklist
When evaluating functions, use this checklist:

Readability: Can you HONESTLY easily follow what it's doing? If yes, then stop here.
Complexity: Does it have very high cyclomatic complexity (number of independent paths/nested if-else)?
Data Structures: Are there common algorithms/structures (parsers, trees, stacks/queues) that would make this much easier to follow?
Parameters: Are there unused parameters in the function?
Type Safety: Any unnecessary type casts that can be moved to function arguments?
Testability: Is it easily testable without mocking core features (SQL queries, Redis, etc.)? If not, can this be tested as part of an integration test?
Dependencies: Any hidden untested dependencies or values that can be factored out into arguments? Only care about non-trivial dependencies that can actually change.
Naming: Brainstorm 3 better function names and see if current name is best and consistent with rest of codebase.

IMPORTANT: Only refactor into separate functions when:

The refactored function is used in more than one place
The refactored function is easily unit testable while the original is not AND you can't test it any other way
The original function is extremely hard to follow and you resort to putting comments everywhere


Test Quality Checklist
When evaluating tests, use this checklist:

Input Parameterization: SHOULD parameterize inputs; never embed unexplained literals like 42 or "foo"
Real Defects: SHOULD NOT add a test unless it can fail for a real defect (no trivial asserts like expect(2).toBe(2))
Clear Description: SHOULD ensure test description states exactly what the final expect verifies
Independent Expectations: SHOULD compare to independent, pre-computed expectations, never to function output re-used as oracle
Code Quality: SHOULD follow same lint, type-safety, and style rules as prod code
Property Testing: SHOULD express invariants/axioms using fast-check whenever practical
Grouping: Unit tests for a function should be grouped under describe(functionName, () => ...)
Flexible Assertions: Use expect.any(...) for variable values (like IDs)
Strong Assertions: ALWAYS use strong assertions over weaker ones
Comprehensive Coverage: SHOULD test edge cases, realistic input, unexpected input, and value boundaries
Type Safety: SHOULD NOT test conditions caught by the type checker