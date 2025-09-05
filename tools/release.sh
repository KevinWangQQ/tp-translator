#!/bin/bash

# TP Translator Release Management Script
# Usage: ./release.sh [version] [type]
# Example: ./release.sh 1.2.1 hotfix

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASES_DIR="$PROJECT_ROOT/releases"
SRC_DIR="$PROJECT_ROOT/src"
ARCHIVES_DIR="$PROJECT_ROOT/archives"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_usage() {
    echo "Usage: $0 [version] [type]"
    echo ""
    echo "Arguments:"
    echo "  version    Version number (e.g., 1.2.1)"
    echo "  type       Release type: stable|beta|alpha|hotfix (default: stable)"
    echo ""
    echo "Examples:"
    echo "  $0 1.2.1                 # Release v1.2.1 stable"
    echo "  $0 1.3.0 beta            # Release v1.3.0 beta"
    echo "  $0 1.2.1 hotfix          # Release v1.2.1 hotfix"
    echo ""
}

validate_version() {
    local version=$1
    if [[ ! $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        log_error "Invalid version format. Expected: MAJOR.MINOR.PATCH (e.g., 1.2.1)"
        return 1
    fi
}

check_prerequisites() {
    if [[ ! -d "$SRC_DIR" ]]; then
        log_error "Source directory not found: $SRC_DIR"
        log_info "Please ensure you have src/ directory with code.js, ui.html, and manifest.json"
        return 1
    fi
    
    if [[ ! -f "$SRC_DIR/manifest.json" ]]; then
        log_error "manifest.json not found in src directory"
        return 1
    fi
    
    if [[ ! -f "$SRC_DIR/code.js" ]]; then
        log_error "code.js not found in src directory"
        return 1
    fi
    
    if [[ ! -f "$SRC_DIR/ui.html" ]]; then
        log_error "ui.html not found in src directory"
        return 1
    fi
}

create_release() {
    local version=$1
    local release_type=$2
    local release_dir="$RELEASES_DIR/v$version"
    local plugin_dir="$release_dir/tp-translator-v$version"
    
    log_info "Creating release v$version ($release_type)..."
    
    # Create release directory
    mkdir -p "$plugin_dir"
    
    # Copy source files
    log_info "Copying source files..."
    cp "$SRC_DIR/code.js" "$plugin_dir/"
    cp "$SRC_DIR/ui.html" "$plugin_dir/"
    cp "$SRC_DIR/manifest.json" "$plugin_dir/"
    
    # Copy additional files if they exist
    if [[ -f "$SRC_DIR/ui.js" ]]; then
        cp "$SRC_DIR/ui.js" "$plugin_dir/"
    fi
    
    # Update version in manifest.json
    log_info "Updating version in manifest.json..."
    if command -v jq >/dev/null 2>&1; then
        jq --arg version "$version" '.version = $version' "$plugin_dir/manifest.json" > "$plugin_dir/manifest.json.tmp"
        mv "$plugin_dir/manifest.json.tmp" "$plugin_dir/manifest.json"
    else
        log_warning "jq not found, skipping automatic version update in manifest.json"
    fi
    
    # Create README for the release
    log_info "Creating README..."
    cat > "$plugin_dir/README.md" << EOF
# TP Translator v$version

## Installation
1. Open Figma Desktop or Web
2. Go to Plugins → Development → Import plugin from manifest
3. Select the \`manifest.json\` file
4. Plugin will be available in your plugins list

## Configuration
1. Click the settings button in the plugin
2. Configure your OpenAI or Gemini API key
3. Set your preferred translation settings

## Support
For issues and support, please refer to the project repository.

---
Generated on $(date)
EOF
    
    # Create zip package
    log_info "Creating zip package..."
    cd "$release_dir"
    zip -r "tp-translator-v$version.zip" "tp-translator-v$version" -x "*.DS_Store" "*/.*" >/dev/null
    cd - >/dev/null
    
    # Create release notes template if not exists
    local release_notes="$release_dir/RELEASE_NOTES_v$version.md"
    if [[ ! -f "$release_notes" ]]; then
        log_info "Creating release notes template..."
        cat > "$release_notes" << EOF
# TP Translator v$version Release Notes

## 📊 Version Information
- **Version**: $version
- **Release Date**: $(date +%Y-%m-%d)
- **Type**: $release_type
- **Compatibility**: Backward compatible
- **Status**: $(echo "$release_type" | tr '[:lower:]' '[:upper:]')

## ✨ New Features
- [Add new features here]

## 🐛 Bug Fixes
- [Add bug fixes here]

## ⚠️ Breaking Changes
- [Add breaking changes if any]

## 📋 Upgrade Instructions
- [Add upgrade instructions]

## 🔍 Known Issues
- [Add known issues if any]

---
Released on $(date)
EOF
    fi
    
    # Update latest symlink for stable releases
    if [[ "$release_type" == "stable" ]]; then
        log_info "Updating latest symlink..."
        cd "$RELEASES_DIR"
        rm -f latest
        ln -sf "v$version" latest
        cd - >/dev/null
    fi
    
    log_success "Release v$version created successfully!"
    log_info "Release directory: $release_dir"
    log_info "Plugin files: $plugin_dir"
    log_info "Package: $release_dir/tp-translator-v$version.zip"
    log_info "Release notes: $release_notes"
}

# Main script
main() {
    # Check arguments
    if [[ $# -lt 1 ]]; then
        show_usage
        exit 1
    fi
    
    local version=$1
    local release_type=${2:-stable}
    
    # Validate inputs
    validate_version "$version" || exit 1
    
    # Check prerequisites
    check_prerequisites || exit 1
    
    # Check if release already exists
    if [[ -d "$RELEASES_DIR/v$version" ]]; then
        log_error "Release v$version already exists!"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Release cancelled."
            exit 0
        fi
        rm -rf "$RELEASES_DIR/v$version"
    fi
    
    # Create the release
    create_release "$version" "$release_type"
    
    log_success "✅ Release process completed!"
    
    # Show next steps
    echo ""
    log_info "Next steps:"
    echo "1. Review and edit: $RELEASES_DIR/v$version/RELEASE_NOTES_v$version.md"
    echo "2. Test the plugin: $RELEASES_DIR/v$version/tp-translator-v$version/"
    echo "3. Distribute: $RELEASES_DIR/v$version/tp-translator-v$version.zip"
}

# Run main function
main "$@"