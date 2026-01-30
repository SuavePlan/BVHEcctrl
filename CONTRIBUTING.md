# Contributing to BVHEcctrl

First off, thank you for considering contributing to BVHEcctrl! It's people like you that make BVHEcctrl such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible.
* **Provide specific examples to demonstrate the steps**.
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots and animated GIFs** if possible.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
* **Provide specific examples to demonstrate the steps** or provide mockups.
* **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
* **Explain why this enhancement would be useful** to most BVHEcctrl users.

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the TypeScript styleguide (enforced by Biome)
* Include thoughtfully-worded, well-structured tests
* Document new code with TSDoc comments
* End all files with a newline

## Development Process

### Setting Up Your Development Environment

1. Fork the repo
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/BVHEcctrl.git
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/my-feature
   ```

### Development Workflow

1. **Make your changes**
   ```bash
   npm run dev  # Start development server
   ```

2. **Run linting and formatting**
   ```bash
   npm run lint        # Check for issues
   npm run lint:fix    # Auto-fix issues
   npm run format      # Format code
   ```

3. **Run type checking**
   ```bash
   npm run type-check
   ```

4. **Write tests**
   - All new features must include tests
   - Aim for 95%+ code coverage
   - Tests should be in `*.test.ts` or `*.test.tsx` files

5. **Run tests**
   ```bash
   npm run test              # Run tests
   npm run test:coverage     # Run with coverage report
   npm run test:ui           # Run with UI
   ```

6. **Build the library**
   ```bash
   npm run build
   ```

7. **Run full validation**
   ```bash
   npm run validate  # Runs lint, type-check, tests, and build
   ```

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

* `feat:` - A new feature
* `fix:` - A bug fix
* `docs:` - Documentation only changes
* `style:` - Changes that don't affect the meaning of the code
* `refactor:` - A code change that neither fixes a bug nor adds a feature
* `perf:` - A code change that improves performance
* `test:` - Adding missing tests or correcting existing tests
* `chore:` - Changes to the build process or auxiliary tools

Examples:
```
feat: add support for custom gravity direction
fix: resolve collision detection issue on slopes
docs: update API documentation for KinematicCollider
test: add tests for StaticCollider component
```

### Testing Guidelines

* **Unit Tests**: Test individual functions and components in isolation
* **Integration Tests**: Test how components work together
* **Coverage**: Maintain 95%+ code coverage
* **Test Quality**: Tests should be clear, maintainable, and test behavior, not implementation

### Code Style

* We use Biome for linting and formatting (automatically enforced)
* Use TypeScript for all code
* Follow the existing code style
* Add TSDoc comments for public APIs
* Avoid `any` types - use proper TypeScript types
* Use meaningful variable and function names

### Performance

* Be mindful of performance in the render loop (useFrame)
* Avoid unnecessary re-renders
* Use `useMemo`, `useCallback`, and `React.memo` appropriately
* Profile your changes if they affect the render loop

## Project Structure

```
BVHEcctrl/
├── src/
│   ├── BVHEcctrl.tsx          # Main character controller
│   ├── StaticCollider.tsx      # Static collision geometry
│   ├── KinematicCollider.tsx   # Moving platforms
│   ├── Joystick.tsx            # Mobile controls
│   ├── VirtualButton.tsx       # Touch controls
│   ├── stores/                 # Zustand state management
│   └── index.ts                # Public API exports
├── example/                    # Demo application
├── dist/                       # Built library (generated)
└── tests/                      # Test files (to be created)
```

## Release Process

Releases are automated using `standard-version`:

1. Update the CHANGELOG: `npm run release`
2. Push changes and tags: `git push --follow-tags origin main`
3. GitHub Actions will publish to npm automatically

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

## Recognition

Contributors will be recognized in our README and release notes.

Thank you for contributing! 🎉
