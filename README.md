# Screen Coordinate Finder

A web utility to record cursor click coordinates in fullscreen mode.

## Features

- **Top-Left Origin**: The coordinate system sets `(0, 0)` at the top-left corner of the screen.
- **Faded Popup**: A low-opacity overlay displays coordinates on click and disappears after two seconds.
- **History Log**: The dashboard lists clicked coordinates with timestamps.
- **Local Storage**: The browser stores the data to preserve it across page refreshes.
- **Export Options**: You can download coordinates in CSV or JSON format.
- **Manage Log**: You can delete single rows or clear the entire history.

## Getting Started

### Prerequisites

You need a web browser that supports the Fullscreen API.

### Run the App

1. Clone this repository.
2. Open `index.html` in your web browser, or run a local static server inside the directory.

For example, to serve using Bun:

```bash
bunx serve
```

Then open `http://localhost:3000` in your browser.
