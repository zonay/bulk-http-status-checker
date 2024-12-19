# Bulk HTTP Status Checker

A Visual Studio Code extension for analyzing HTTP status codes and redirect chains for multiple URLs simultaneously. Designed for developers and system administrators who need to verify URL statuses in bulk.

## Features

- Complete redirect chain analysis
- Bulk URL processing capabilities
- Multiple export formats (JSON/CSV)
- SSL verification bypass support


## Usage

1. Access the extension through the activity bar
2. Add URLs using either method:
   - Bulk paste from clipboard
   - Individual URL entry
3. Initialize the check process
4. View detailed results in the report panel

## Development

### Prerequisites
- Node.js
- Visual Studio Code

### Setup
```bash
npm install          # Install dependencies
npm run compile     # Build the extension
npm run watch       # Development mode
```

## Core Functionality

### URL Management
- Clipboard support for bulk operations
- URL validation and formatting
- List management interface

### Analysis Features
- Status code tracking
- Redirect chain visualization
- SSL certificate handling
- Real-time progress monitoring

### Export Capabilities
- JSON format for data processing
- CSV format for spreadsheet analysis
- Clipboard integration



## Developer Information

**Author**: Zafer Onay  
**Repository**: [bulk-http-status-checker](https://github.com/zonay/bulk-http-status-checker)  
**Issues**: [Bug Reports](https://github.com/zonay/bulk-http-status-checker/issues)

## License

MIT License - See LICENSE file for details