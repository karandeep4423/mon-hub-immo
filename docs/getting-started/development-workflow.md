# Development Workflow

> Day-to-day development practices and workflows

## Table of Contents

- [Daily Workflow](#daily-workflow)
- [Git Workflow](#git-workflow)
- [Code Standards](#code-standards)
- [Development Process](#development-process)
- [Testing Workflow](#testing-workflow)
- [Code Review Process](#code-review-process)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)

---

## Daily Workflow

### Starting Work

1. **Pull latest changes**

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Install new dependencies** (if package.json changed)

   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

3. **Check environment variables**

   ```bash
   # Ensure .env files are up to date
   # Compare with .env.example if exists
   ```

4. **Start development servers**

   ```powershell
   # Terminal 1 - Server
   cd server
   npm run dev  # Auto-restarts on changes

   # Terminal 2 - Client
   cd client
   npm run dev  # Runs on port 3000 with Turbopack
   ```

5. **Verify everything works**
   - Check http://localhost:3000
   - Check http://localhost:4000/api/health
   - Look for errors in terminals

### During Development

**Auto-reload is enabled:**

- Server: `ts-node-dev` automatically restarts on file changes
- Client: Next.js with Turbopack hot-reloads instantly

**File watching:**

```bash
# Both servers watch for changes:
# - Server: All .ts files in src/
# - Client: All files in app/, components/, etc.
```

**Common development loop:**

1. Make code changes
2. Save files (auto-format with Prettier on save)
3. Check terminal for compilation errors
4. Check browser for runtime errors
5. Test functionality manually
6. Repeat

### End of Day

1. **Commit your work**

   ```bash
   git add .
   git commit -m "feat: descriptive message"
   git push origin feature-branch
   ```

2. **Update documentation** if needed

   ```bash
   # Update relevant docs in /docs
   ```

3. **Close tickets/issues**
   - Update Jira/GitHub issues
   - Add progress comments

---

## Git Workflow

### Branch Strategy

**Main Branches:**

- `main` - Production-ready code
- `develop` - Integration branch (if using GitFlow)

**Feature Branches:**

```bash
# Create feature branch from main
git checkout -b feature/user-authentication
git checkout -b feature/property-filters

# Bug fixes
git checkout -b fix/login-error
git checkout -b fix/image-upload

# Hot fixes (urgent production fixes)
git checkout -b hotfix/security-patch
```

### Commit Message Convention

**Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes

**Examples:**

```bash
# Good commit messages
git commit -m "feat(auth): add email verification flow"
git commit -m "fix(property): correct price calculation"
git commit -m "docs(api): update authentication endpoints"
git commit -m "refactor(chat): extract message handler logic"

# Bad commit messages (avoid)
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "updates"
```

**Detailed commit:**

```bash
git commit -m "feat(collaboration): add contract signing workflow

- Add contract template generation
- Implement dual-signature requirement
- Add contract modification tracking
- Update collaboration status on completion

Closes #123"
```

### Branching Workflow

1. **Create branch**

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes and commit regularly**

   ```bash
   git add .
   git commit -m "feat: initial implementation"
   # ... more work ...
   git commit -m "feat: add validation"
   ```

3. **Keep branch up to date**

   ```bash
   # Rebase on main regularly
   git fetch origin
   git rebase origin/main
   ```

4. **Push to remote**

   ```bash
   git push origin feature/new-feature
   ```

5. **Create Pull Request**

   - Go to GitHub
   - Open PR from your branch to main
   - Fill in PR template
   - Request reviews

6. **Address review comments**

   ```bash
   # Make changes
   git add .
   git commit -m "fix: address review comments"
   git push origin feature/new-feature
   ```

7. **Merge** (after approval)

   - Squash and merge (preferred for clean history)
   - Or regular merge (if keeping commit history)

8. **Clean up**
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/new-feature  # Delete local branch
   ```

### Git Best Practices

**DO:**

- ✅ Commit frequently with meaningful messages
- ✅ Pull before starting work
- ✅ Rebase on main regularly
- ✅ Review your changes before committing
- ✅ Use `.gitignore` for sensitive files

**DON'T:**

- ❌ Commit directly to main
- ❌ Commit `.env` files
- ❌ Force push to shared branches
- ❌ Commit `node_modules/`
- ❌ Use generic commit messages

---

## Code Standards

### TypeScript Standards

**Type Safety:**

```typescript
// ✅ GOOD - Explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = (id: string): Promise<User> => {
  return api.get(`/users/${id}`);
};

// ❌ BAD - Using any
const getUser = (id: any): any => {
  return api.get(`/users/${id}`);
};
```

**No `any` types:**

```typescript
// ❌ AVOID
function processData(data: any) {}

// ✅ PREFER
function processData(data: unknown) {
  // Type guard
  if (typeof data === "object" && data !== null) {
    // Now TypeScript knows data is an object
  }
}

// ✅ BEST - Define proper types
interface DataType {
  id: string;
  value: number;
}
function processData(data: DataType) {}
```

### Component Standards

**Functional components:**

```typescript
// ✅ GOOD - Arrow function component
const PropertyCard: React.FC<{ property: IProperty }> = ({ property }) => {
  const [isLiked, setIsLiked] = useState(false);

  return <div className="property-card">{/* ... */}</div>;
};

// ❌ AVOID - Class components (unless necessary)
class PropertyCard extends React.Component {}
```

**Component organization:**

```typescript
// PropertyCard.tsx

// 1. Imports
import { useState } from "react";
import type { IProperty } from "@/types/property";

// 2. Types/Interfaces
interface PropertyCardProps {
  property: IProperty;
  onLike?: (id: string) => void;
}

// 3. Component
export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onLike,
}) => {
  // Hooks
  const [isLiked, setIsLiked] = useState(false);

  // Event handlers
  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(property._id);
  };

  // Render
  return <div className="property-card">{/* ... */}</div>;
};
```

### Naming Conventions

**Files:**

```
✅ Components: PascalCase - UserProfile.tsx
✅ Hooks: camelCase - useAuth.ts
✅ Utils: camelCase - formatters.ts
✅ Types: camelCase - auth.ts
✅ Pages: kebab-case - complete-profile/page.tsx
```

**Variables:**

```typescript
// ✅ GOOD
const userName = "John";
const isActive = true;
const propertyList = [];
const handleSubmit = () => {};

// ❌ BAD
const UserName = "John";
const active = true; // Not descriptive
const list = []; // Too generic
const submit = () => {}; // Missing handle prefix
```

**Constants:**

```typescript
// ✅ Use UPPER_CASE for true constants
const API_BASE_URL = "http://localhost:4000";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ✅ Use descriptive object names
const PROPERTY_TYPES = {
  APARTMENT: "Appartement",
  HOUSE: "Maison",
  LAND: "Terrain",
};
```

### Code Formatting

**Prettier (automatic):**

- Tab indentation
- Single quotes
- Trailing commas
- Semicolons

**ESLint (automatic):**

- No unused variables
- No console.log (use logger)
- Prefer const over let
- Arrow functions preferred

**Pre-commit hooks (Husky):**

```bash
# Automatically runs on git commit:
# 1. Prettier formatting
# 2. ESLint linting
# 3. TypeScript type checking
```

---

## Development Process

### Adding a New Feature

1. **Create branch**

   ```bash
   git checkout -b feature/property-search-filters
   ```

2. **Plan implementation**

   - Define API endpoints needed
   - Design data models
   - Sketch component structure
   - Identify shared utilities

3. **Backend first (if needed)**

   ```typescript
   // 1. Define types (server/src/types/)
   // 2. Create/update model (server/src/models/)
   // 3. Add validation (server/src/validation/)
   // 4. Create controller (server/src/controllers/)
   // 5. Add routes (server/src/routes/)
   // 6. Test API with Thunder Client/Postman
   ```

4. **Frontend implementation**

   ```typescript
   // 1. Define types (client/types/)
   // 2. Create components (client/components/)
   // 3. Add hooks if needed (client/hooks/)
   // 4. Update pages (client/app/)
   // 5. Add to navigation
   ```

5. **Testing**

   - Manual testing in browser
   - Edge cases
   - Error scenarios
   - Mobile responsiveness

6. **Documentation**

   - Update API docs if endpoints added
   - Add component documentation
   - Update README if needed

7. **Commit and PR**
   ```bash
   git add .
   git commit -m "feat(property): add advanced search filters"
   git push origin feature/property-search-filters
   ```

### Fixing a Bug

1. **Reproduce the bug**

   - Understand the issue
   - Find steps to reproduce
   - Check browser console/server logs

2. **Locate the problem**

   - Use debugger or console.log
   - Check recent changes
   - Review error stack trace

3. **Create fix branch**

   ```bash
   git checkout -b fix/property-price-calculation
   ```

4. **Implement fix**

   - Make minimal changes
   - Don't refactor while fixing
   - Add validation if missing

5. **Test thoroughly**

   - Verify fix works
   - Test edge cases
   - Ensure no regression

6. **Commit**

   ```bash
   git commit -m "fix(property): correct agency fee calculation

   - Fix percentage calculation logic
   - Add validation for negative values
   - Update price including fees

   Fixes #234"
   ```

---

## Testing Workflow

### Manual Testing

**Before committing:**

1. Test happy path (expected behavior)
2. Test error cases (invalid input, network errors)
3. Test edge cases (empty data, max values)
4. Test different user roles (agent, apporteur, admin)
5. Test on different browsers (Chrome, Firefox, Safari)

**Testing checklist:**

```
✅ Feature works as expected
✅ No console errors
✅ No TypeScript errors
✅ Responsive on mobile
✅ Loading states work
✅ Error messages are clear
✅ Navigation works correctly
✅ Forms validate properly
✅ API responses handled correctly
```

### Automated Testing

**Run tests:**

```bash
# Server tests
cd server
npm test

# Client tests (if configured)
cd client
npm test
```

**Writing tests:**

```typescript
// server/src/__tests__/auth.test.ts
import { signup } from "../controllers/authController";

describe("Auth Controller", () => {
  it("should create new user", async () => {
    // Test implementation
  });

  it("should reject duplicate email", async () => {
    // Test implementation
  });
});
```

---

## Code Review Process

### Submitting for Review

**PR Description Template:**

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made

- Added X feature
- Fixed Y bug
- Updated Z component

## Testing

- [ ] Tested locally
- [ ] Manual testing completed
- [ ] No console errors

## Screenshots (if UI changes)

[Attach screenshots]

## Related Issues

Closes #123
```

### Reviewing Code

**What to check:**

1. **Functionality**: Does it work?
2. **Code quality**: Is it clean and maintainable?
3. **Standards**: Follows project conventions?
4. **Performance**: Any performance concerns?
5. **Security**: No vulnerabilities introduced?
6. **Tests**: Adequate testing?

**Review comments:**

```markdown
✅ Approve: Looks good!
📝 Comment: Consider using useMemo here for performance
🔴 Request changes: This introduces a security vulnerability
```

---

## Debugging

### Frontend Debugging

**Browser DevTools:**

```javascript
// Console logging (use sparingly)
console.log("User data:", user);

// Debugger
debugger; // Pauses execution

// React DevTools
// Install extension to inspect component tree
```

**Network tab:**

- Check API requests/responses
- Verify headers (auth token)
- Check status codes

**Next.js debugging:**

```javascript
// In next.config.ts
const nextConfig = {
  reactStrictMode: true,
  // Enable source maps
  productionBrowserSourceMaps: true,
};
```

### Backend Debugging

**Logging:**

```typescript
import { logger } from "../utils/logger";

logger.debug("Processing request", { userId, data });
logger.error("Failed to save", error);
```

**VS Code debugger:**

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/server"
    }
  ]
}
```

---

## Common Tasks

### Adding a New API Endpoint

```typescript
// 1. Add route (server/src/routes/property.ts)
router.post("/properties", authenticateToken, createProperty);

// 2. Create controller (server/src/controllers/propertyController.ts)
export const createProperty = async (req, res) => {
  try {
    const property = await Property.create(req.body);
    res.status(201).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Call from client (client/lib/api.ts)
export const createProperty = (data) => {
  return api.post("/properties", data);
};
```

### Adding Environment Variable

```bash
# 1. Add to .env
NEW_API_KEY=your-key-here

# 2. Use in code
const apiKey = process.env.NEW_API_KEY;

# 3. Document in configuration.md
# 4. Add to .env.example (without actual value)
NEW_API_KEY=your-api-key-here
```

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm install package-name@latest

# Update all (careful!)
npm update

# After updating, test thoroughly
npm test
npm run build
```

---

## Best Practices

1. **Commit often**: Small, focused commits
2. **Test before committing**: Always verify your changes
3. **Write clear messages**: Future you will thank you
4. **Document as you go**: Don't leave it for later
5. **Ask for help**: When stuck, reach out
6. **Review your own code**: Before submitting PR
7. **Keep PRs small**: Easier to review and merge
8. **Update regularly**: Pull from main frequently

---

## Next Steps

- 📖 [Code Style Guide](../guides/code-style.md) - Detailed coding standards
- 🔀 [Git Workflow](../guides/git-workflow.md) - Advanced Git practices
- 🐛 [Debugging Guide](../guides/debugging.md) - Debugging techniques
- 📝 [Contributing](../contributing.md) - Contribution guidelines

---

**Consistent workflow leads to better code quality!**
