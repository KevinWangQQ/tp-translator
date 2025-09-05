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
VERSION_HISTORY="$PROJECT_ROOT/VERSION_HISTORY.md"

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

update_version_history() {
    local version=$1
    local release_type=$2
    local release_dir="$3"
    
    if [[ ! -f "$VERSION_HISTORY" ]]; then
        log_warning "VERSION_HISTORY.md not found, skipping history update"
        return 0
    fi
    
    log_info "Updating version history..."
    
    local current_date=$(date +%Y-%m-%d)
    local release_date=$(date +%Y-%m-%d)
    
    # Create backup
    cp "$VERSION_HISTORY" "$VERSION_HISTORY.backup"
    
    # Update the overview table - change status from Planned to Released
    if grep -q "| v$version |.*📅 Planned" "$VERSION_HISTORY"; then
        # Update existing planned version
        sed -i '' "s/| v$version |.*📅 Planned.*|.*/| v$version | ✅ Released | $release_date | $(echo $release_type | tr '[:lower:]' '[:upper:]') | Released stable version |/" "$VERSION_HISTORY"
        log_info "Updated planned version v$version to released status"
    else
        # Add new version to overview table (after the header)
        local table_entry="| v$version | ✅ Released | $release_date | $(echo $release_type | tr '[:lower:]' '[:upper:]') | Released version |"
        sed -i '' "/|------|------|----------|------|------|/a\\
$table_entry" "$VERSION_HISTORY"
        log_info "Added new version v$version to overview table"
    fi
    
    # Get package size
    local zip_file="$release_dir/tp-translator-v$version.zip"
    local package_size="Unknown"
    if [[ -f "$zip_file" ]]; then
        package_size=$(ls -lh "$zip_file" | awk '{print $5}')
    fi
    
    # Check if detailed section already exists
    if grep -q "### v$version -" "$VERSION_HISTORY"; then
        # Update existing section - change status to completed
        sed -i '' "s/#### 📋 版本概述.*/#### 📋 版本概述\\
这个版本已成功发布，包含计划的所有功能。/" "$VERSION_HISTORY"
        
        # Update release info section if it exists, otherwise add it
        if grep -A 20 "### v$version -" "$VERSION_HISTORY" | grep -q "#### 📦 发布信息"; then
            # Update existing release info
            sed -i '' "/#### 📦 发布信息/,/#### [^📦]/ {
                s/- \*\*包大小\*\*:.*/- **包大小**: $package_size/
                s/- \*\*文件位置\*\*:.*/- **文件位置**: \`releases\/v$version\/tp-translator-v$version.zip\`/
            }" "$VERSION_HISTORY"
        else
            # Add release info section before any existing sections after the overview
            local temp_file=$(mktemp)
            awk -v version="v$version" -v size="$package_size" '
            /^### / && match($0, version) { in_section=1; print; next }
            in_section && /^#### / && !release_info_added { 
                print "#### 📦 发布信息"
                print "- **包大小**: " size
                print "- **文件位置**: `releases/" version "/tp-translator-" version ".zip`"
                print "- **发布日期**: " strftime("%Y-%m-%d")
                print ""
                release_info_added=1
            }
            /^### / && !match($0, version) && in_section { in_section=0 }
            { print }
            ' "$VERSION_HISTORY" > "$temp_file"
            mv "$temp_file" "$VERSION_HISTORY"
        fi
    else
        # Create new detailed section for the version
        local detailed_section="### v$version - Released Version
**发布日期**: $release_date  
**版本类型**: $(get_release_type_description "$release_type")  
**开发状态**: ✅ 已完成  

#### 📋 版本概述
版本 v$version 已成功发布。

#### 📦 发布信息
- **包大小**: $package_size
- **文件位置**: \`releases/v$version/tp-translator-v$version.zip\`
- **发布日期**: $release_date

#### 🎯 使用建议
- 适合生产环境使用
- 详细功能说明请参考发布说明文档

---"
        
        # Add to detailed records section
        local insertion_point="## 📝 详细版本记录"
        sed -i '' "/$insertion_point/a\\
\\
$detailed_section" "$VERSION_HISTORY"
    fi
    
    # Update the last modified date
    sed -i '' "s/最后更新: [0-9-]*/最后更新: $current_date/" "$VERSION_HISTORY"
    
    log_success "Version history updated successfully"
}

get_release_type_description() {
    local type=$1
    case $type in
        stable) echo "Stable Release" ;;
        beta) echo "Beta Release" ;;
        alpha) echo "Alpha Release" ;;
        hotfix) echo "Hotfix Release" ;;
        *) echo "Release" ;;
    esac
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
    
    # Note: Figma manifest doesn't support version field, skipping version update
    log_info "Manifest.json copied (Figma doesn't support version field in manifest)"
    
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
    
    # Update version history
    update_version_history "$version" "$release_type" "$release_dir"
    
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