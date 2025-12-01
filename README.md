# Pixiv Paperback Extension

A [Paperback](https://paperback.moe/) extension for browsing Pixiv manga and illustrations through a custom proxy server.

## Features

- 📖 Browse Pixiv manga and illustrations
- 🔍 Search by keyword or author
- 📊 Daily, Weekly, and R18 rankings
- 🔐 R18 content support (requires Pixiv login on proxy server)
- ⚙️ Configurable proxy server URL

## Requirements

- [Paperback App](https://paperback.moe/) v0.8+
- A running instance of the [Pixiv Image API](https://github.com/chiraitori/image-api) proxy server

## Installation

### Add Extension Repository

1. Open Paperback app
2. Go to **Settings** → **External Sources**
3. Add the following repository URL:
   ```
   https://chiraitori.github.io/paperback-extensions
   ```
4. Find **Pixiv** in the sources list and install it

### Configure the Extension

1. After installing, go to **Settings** → **Sources** → **Pixiv**
2. Set your proxy server URL (e.g., `http://your-server:8080`)
3. Save settings

## Proxy Server Setup

This extension requires the Pixiv Image API proxy server. See [image-api](https://github.com/chiraitori/image-api) for setup instructions.

Quick start:
```bash
# Clone the proxy server
git clone https://github.com/chiraitori/image-api
cd image-api

# Set Pixiv session for R18 content (optional)
export PHPSESSID="your_pixiv_session_cookie"

# Run the server
go run main.go
```

The server will start on `http://localhost:8080` by default.

## Development

### Prerequisites

- Node.js 16+
- npm or yarn

### Build

```bash
# Install dependencies
npm install

# Build the extension
npm run bundle

# Start development server (hot reload)
npm run dev
```

### Project Structure

```
├── src/
│   └── Pixiv/
│       ├── Pixiv.ts      # Main extension source
│       ├── Settings.ts   # Extension settings UI
│       └── includes/
│           └── icon.png  # Extension icon
├── bundles/              # Built extension files
└── package.json
```

## API Endpoints Used

| Endpoint | Description |
|----------|-------------|
| `GET /api/ranking?mode={mode}` | Get ranking (daily, weekly, daily_r18, etc.) |
| `GET /api/search?q={query}` | Search illustrations |
| `GET /api/illust/{id}` | Get illustration details |
| `GET /api/illust/{id}/pages` | Get illustration pages |
| `GET /api/image/{url}` | Proxy image from Pixiv |

## License

GPL-3.0-or-later

## Acknowledgments

- [Paperback](https://paperback.moe/) - iOS manga reader app
- [Pixiv](https://www.pixiv.net/) - Image sharing platform