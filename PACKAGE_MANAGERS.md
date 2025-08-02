# Package Manager Performance

This project supports both `pnpm` and `npm` package managers. Here's the performance comparison:

## Installation Time Comparison

| Package Manager | Installation Time | Notes |
|----------------|------------------|-------|
| **pnpm** (recommended) | ~2m 17s | Fastest, designed for this project |
| **npm** (with .npmrc optimizations) | ~2m 47s | Optimized with `.npmrc` configuration |
| **npm** (without optimizations) | ~6m 28s | Significantly slower |

## Recommendations

1. **Use pnpm for best performance**:
   ```bash
   npm install -g pnpm
   pnpm install
   ```

2. **If you prefer npm**, the included `.npmrc` file provides optimizations that reduce install time by ~60%.

3. **For CI/CD**: Consider using pnpm for faster builds.

## The optimizations in .npmrc

- `prefer-online=true`: Prefer downloading from registry over local cache
- `fetch-timeout=300000`: Increase timeout for large packages 
- `fetch-retries=3`: Retry failed downloads
- `package-lock=true`: Ensure package-lock.json is generated
- `save-exact=true`: Save exact versions to reduce dependency conflicts