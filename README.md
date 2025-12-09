# ChronoPulse

A modern, accurate clock application.

## Development

### Prerequisites

- [Nix](https://nixos.org/download.html) (optional, but recommended for reproducible environment)
- Node.js 20+ (if not using Nix)

### Running Locally

1. **With Nix:**
   ```bash
   nix develop
   npm install
   npm run dev
   ```

2. **Without Nix:**
   ```bash
   npm install
   npm run dev
   ```

## Testing

Run the test suite with:

```bash
npm test
```

## Building for Production

To build the application (outputs to `docs/` for GitHub Pages):

```bash
npm run build
```

## License

MIT License. See [LICENSE](LICENSE) for details.
