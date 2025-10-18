# API Authentication Test Suite

This test suite documents and validates the authentication refactoring for Zenara's API endpoints.

## Test Structure

### 1. `auth.test.ts`

- Tests authentication helper functions
- Documents expected authentication behavior
- Tests both authenticated and unauthenticated scenarios

### 2. `tasks.test.ts`

- Tests `/api/tasks` endpoint authentication
- Validates that userId parameters are ignored
- Tests user isolation (users can only access their own data)

### 3. `prompts.test.ts`

- Tests `/api/prompts` endpoint (already refactored)
- Validates proper authentication flow
- Tests input validation

### 4. `security-vulnerabilities.test.ts`

- Documents current security vulnerabilities
- Tests attack scenarios
- Validates security improvements after refactoring

## Current Status

✅ **Completed**: `/api/prompts` - Already refactored with proper authentication  
❌ **Needs Refactoring**:

- `/api/tasks`
- `/api/pomodoro-sessions`
- `/api/note-versions`
- `/api/process-note`
- `/api/process-note-stream`

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- __tests__/api/tasks.test.ts
```

## Test-Driven Refactoring Process

1. **Run tests initially** - Most should fail, documenting current vulnerabilities
2. **Implement authentication middleware** - Create reusable auth helper
3. **Refactor API routes one by one** - Fix each endpoint to use proper auth
4. **Update tests** - Replace placeholders with actual assertions
5. **Verify security** - Ensure all attack scenarios are prevented

## Expected Test Results

### Before Refactoring

- Many tests will fail (documenting vulnerabilities)
- Security tests will show current issues
- Authentication tests will show missing auth

### After Refactoring

- All authentication tests should pass
- Security vulnerability tests should prevent attacks
- User isolation should be enforced

## Security Improvements

After refactoring, the following security issues should be resolved:

1. **No more userId parameters** - APIs derive user from auth session
2. **Authentication required** - All user data endpoints require auth
3. **User isolation** - Users can only access their own data
4. **Input validation** - All request data is validated
5. **RLS enforcement** - Database policies prevent cross-user access
