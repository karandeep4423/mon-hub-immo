# Contributing Guide

> Guidelines for contributing to MonHubImmo

---

## 🤝 Welcome Contributors

Thank you for considering contributing to MonHubImmo! This guide will help you get started.

---

## 🚀 Quick Start

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/mon-hub-immo.git
cd mon-hub-immo
```

### 2. Setup Development Environment

```bash
# Install dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..

# Copy environment files
cp client/.env.example client/.env.local
cp server/.env.example server/.env

# Start development servers
cd server && npm start &
cd client && npm run dev
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

---

## 📁 Branch Naming Convention

| Type     | Pattern                | Example                    |
| -------- | ---------------------- | -------------------------- |
| Feature  | `feature/description`  | `feature/chat-attachments` |
| Bug Fix  | `fix/description`      | `fix/login-redirect`       |
| Hotfix   | `hotfix/description`   | `hotfix/payment-webhook`   |
| Refactor | `refactor/description` | `refactor/auth-middleware` |
| Docs     | `docs/description`     | `docs/api-endpoints`       |

---

## 💻 Code Style

### General Rules

- **TypeScript everywhere** - No `any` types
- **Functional components** - No class components
- **Single responsibility** - Keep files under 200-300 lines
- **DRY principle** - Reuse existing utilities

### Formatting

```javascript
// Enforced by Prettier
{
  "tabWidth": 2,
  "useTabs": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Naming Conventions

| Type       | Convention      | Example            |
| ---------- | --------------- | ------------------ |
| Components | PascalCase      | `PropertyCard.tsx` |
| Hooks      | camelCase + use | `useProperties.ts` |
| Utils      | camelCase       | `formatPrice.ts`   |
| Constants  | SCREAMING_SNAKE | `MAX_FILE_SIZE`    |
| Types      | PascalCase      | `PropertyFilter`   |

### File Organization

```
components/
├── property/
│   ├── PropertyCard.tsx      # Component
│   ├── PropertyCard.test.tsx # Tests
│   ├── styles.module.css     # Styles (if needed)
│   └── index.ts              # Export
```

---

## 📝 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description                 |
| ---------- | --------------------------- |
| `feat`     | New feature                 |
| `fix`      | Bug fix                     |
| `docs`     | Documentation               |
| `style`    | Formatting (no code change) |
| `refactor` | Code refactoring            |
| `test`     | Adding tests                |
| `chore`    | Maintenance                 |

### Examples

```bash
# Feature
git commit -m "feat(chat): add file attachment support"

# Bug fix
git commit -m "fix(auth): resolve token refresh loop"

# With body
git commit -m "refactor(api): simplify error handling

- Extract common error handler
- Add typed error responses
- Update all controllers to use new pattern"
```

---

## 🔀 Pull Request Process

### 1. Before Opening PR

- [ ] Code follows style guide
- [ ] All tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Self-reviewed the changes
- [ ] Updated documentation if needed

### 2. PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?

Describe testing approach

## Screenshots (if applicable)

Add screenshots for UI changes

## Checklist

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log statements
```

### 3. Code Review

- At least 1 approval required
- Address all feedback
- Keep PR focused (one concern per PR)
- Small PRs are preferred

---

## 🧪 Testing Requirements

### New Features

```typescript
// Every new feature needs tests
describe("NewFeature", () => {
  it("should handle happy path", () => {});
  it("should handle error cases", () => {});
  it("should validate inputs", () => {});
});
```

### Bug Fixes

```typescript
// Bug fix should include regression test
describe("BugFix", () => {
  it("should not regress: [describe the bug]", () => {
    // Test that verifies the bug is fixed
  });
});
```

### Coverage

- New code should maintain >80% coverage
- Don't decrease overall coverage

---

## 📐 Architecture Guidelines

### Frontend Patterns

```typescript
// ✅ Use custom hooks for logic
const usePropertyForm = () => {
  const [data, setData] = useState();
  // ... logic
  return { data, setData };
};

// ✅ Use Zustand for global state
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// ✅ Use useFetch/useMutation
const { data, loading } = useFetch(() => api.get("/endpoint"));

// ❌ Avoid manual fetch state
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
useEffect(() => {
  /* fetch */
}, []);
```

### Backend Patterns

```typescript
// ✅ Use Zod for validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// ✅ Consistent error handling
export const controller = async (req, res) => {
  try {
    // ... logic
    res.json({ data });
  } catch (error) {
    handleError(res, error);
  }
};

// ✅ Use middleware for cross-cutting concerns
router.post("/endpoint", authenticateToken, validateBody(schema), controller);
```

---

## 🐛 Bug Reports

### Template

```markdown
## Bug Description

Clear description of the bug

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Screenshots

If applicable

## Environment

- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node: [e.g., 20.10.0]
```

---

## 💡 Feature Requests

### Template

```markdown
## Feature Description

Clear description of the feature

## Use Case

Why is this feature needed?

## Proposed Solution

How might this work?

## Alternatives Considered

Other approaches considered

## Additional Context

Mockups, examples, etc.
```

---

## 📚 Documentation

### When to Update Docs

- New feature added
- API endpoint changed
- Configuration changed
- Breaking change introduced

### Documentation Locations

| What          | Where                   |
| ------------- | ----------------------- |
| API docs      | `docs/api/`             |
| Feature docs  | `docs/features/`        |
| Setup guide   | `docs/getting-started/` |
| Code comments | Inline                  |

---

## 🔒 Security

### Reporting Security Issues

**Do NOT open public issues for security vulnerabilities.**

Email security concerns to: security@monhubimmo.fr

### Security Guidelines

- Never commit secrets
- Validate all inputs
- Use parameterized queries
- Sanitize outputs
- Follow OWASP guidelines

---

## 📞 Getting Help

- **Questions**: Open a Discussion
- **Bugs**: Open an Issue
- **Security**: Email security@monhubimmo.fr
- **Chat**: Join our Discord (if available)

---

## 🎉 Recognition

Contributors are recognized in:

- README.md Contributors section
- Release notes
- Monthly highlights

---

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the project
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Public or private harassment

---

_Thank you for contributing to MonHubImmo! 🏠_
