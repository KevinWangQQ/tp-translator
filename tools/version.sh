#!/bin/bash

# TP Translator Version Management Script
# Usage: ./version.sh [command] [options]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASES_DIR="$PROJECT_ROOT/releases"

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
    echo "TP Translator Version Management Tool"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  list                List all versions"
    echo "  info [version]      Show version information"
    echo "  latest              Show latest version"
    echo "  archive [version]   Archive a version"
    echo "  status              Show release status summary"
    echo "  cleanup             Clean up temporary files"
    echo ""
    echo "Examples:"
    echo "  $0 list             # List all versions"
    echo "  $0 info 1.2.0       # Show info for v1.2.0"
    echo "  $0 latest           # Show latest version"
    echo "  $0 archive 1.1.0    # Archive v1.1.0"
    echo ""
}

list_versions() {
    log_info "Available versions:"
    echo ""
    
    if [[ ! -d "$RELEASES_DIR" ]]; then
        log_warning "No releases directory found"
        return
    fi
    
    local latest_link=""
    if [[ -L "$RELEASES_DIR/latest" ]]; then
        latest_link=$(readlink "$RELEASES_DIR/latest")
    fi
    
    for version_dir in "$RELEASES_DIR"/v*; do
        if [[ -d "$version_dir" ]]; then
            local version=$(basename "$version_dir")
            local version_num=${version#v}
            local status="📦"
            local marker=""
            
            # Check if it's the latest
            if [[ "$version" == "$latest_link" ]]; then
                marker=" ${GREEN}(latest)${NC}"
                status="🚀"
            fi
            
            # Check if archived
            if [[ -f "$version_dir/.archived" ]]; then
                status="📦"
                marker=" ${YELLOW}(archived)${NC}"
            fi
            
            # Get release date if available
            local date_info=""
            if [[ -f "$version_dir/RELEASE_NOTES_v$version_num.md" ]]; then
                date_info=$(grep "Release Date:" "$version_dir/RELEASE_NOTES_v$version_num.md" 2>/dev/null | cut -d: -f2 | xargs || echo "")
                if [[ -n "$date_info" ]]; then
                    date_info=" - $date_info"
                fi
            fi
            
            printf "  %s %s%s%s\n" "$status" "$version_num" "$date_info" "$marker"
        fi
    done
}

show_version_info() {
    local version=$1
    
    if [[ -z "$version" ]]; then
        log_error "Version number required"
        echo "Usage: $0 info [version]"
        return 1
    fi
    
    local version_dir="$RELEASES_DIR/v$version"
    
    if [[ ! -d "$version_dir" ]]; then
        log_error "Version v$version not found"
        return 1
    fi
    
    log_info "Version Information: v$version"
    echo ""
    
    # Show directory contents
    echo "📁 Files:"
    ls -la "$version_dir" | tail -n +2 | while read -r line; do
        echo "   $line"
    done
    echo ""
    
    # Show zip file size if exists
    local zip_file="$version_dir/tp-translator-v$version.zip"
    if [[ -f "$zip_file" ]]; then
        local size=$(ls -lh "$zip_file" | awk '{print $5}')
        echo "📦 Package size: $size"
    fi
    
    # Show release notes excerpt if available
    local release_notes="$version_dir/RELEASE_NOTES_v$version.md"
    if [[ -f "$release_notes" ]]; then
        echo ""
        echo "📝 Release Notes (excerpt):"
        head -n 15 "$release_notes" | sed 's/^/   /'
    fi
}

show_latest() {
    if [[ -L "$RELEASES_DIR/latest" ]]; then
        local latest=$(readlink "$RELEASES_DIR/latest")
        local version=${latest#v}
        log_success "Latest version: v$version"
        
        # Show additional info
        show_version_info "$version"
    else
        log_warning "No latest version symlink found"
    fi
}

archive_version() {
    local version=$1
    
    if [[ -z "$version" ]]; then
        log_error "Version number required"
        echo "Usage: $0 archive [version]"
        return 1
    fi
    
    local version_dir="$RELEASES_DIR/v$version"
    
    if [[ ! -d "$version_dir" ]]; then
        log_error "Version v$version not found"
        return 1
    fi
    
    # Check if it's the latest version
    if [[ -L "$RELEASES_DIR/latest" ]]; then
        local latest=$(readlink "$RELEASES_DIR/latest")
        if [[ "$latest" == "v$version" ]]; then
            log_error "Cannot archive the latest version"
            return 1
        fi
    fi
    
    log_info "Archiving version v$version..."
    
    # Create archive marker
    touch "$version_dir/.archived"
    
    # Move to archives directory
    mkdir -p "$PROJECT_ROOT/archives/versions"
    mv "$version_dir" "$PROJECT_ROOT/archives/versions/"
    
    log_success "Version v$version archived successfully"
}

show_status() {
    log_info "Release Status Summary"
    echo ""
    
    # Count versions
    local total=0
    local stable=0
    local archived=0
    
    if [[ -d "$RELEASES_DIR" ]]; then
        for version_dir in "$RELEASES_DIR"/v*; do
            if [[ -d "$version_dir" ]]; then
                ((total++))
                if [[ -f "$version_dir/.archived" ]]; then
                    ((archived++))
                else
                    ((stable++))
                fi
            fi
        done
    fi
    
    echo "📊 Statistics:"
    echo "   Total versions: $total"
    echo "   Active versions: $stable"
    echo "   Archived versions: $archived"
    echo ""
    
    # Show latest version
    if [[ -L "$RELEASES_DIR/latest" ]]; then
        local latest=$(readlink "$RELEASES_DIR/latest")
        local version=${latest#v}
        echo "🚀 Current latest: v$version"
    else
        echo "⚠️  No latest version set"
    fi
    
    # Show disk usage
    if [[ -d "$RELEASES_DIR" ]]; then
        local size=$(du -sh "$RELEASES_DIR" 2>/dev/null | cut -f1 || echo "Unknown")
        echo "💾 Total size: $size"
    fi
}

cleanup() {
    log_info "Cleaning up temporary files..."
    
    # Remove .DS_Store files
    find "$PROJECT_ROOT" -name ".DS_Store" -type f -delete 2>/dev/null || true
    
    # Remove empty directories
    find "$RELEASES_DIR" -type d -empty -delete 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Main function
main() {
    if [[ $# -eq 0 ]]; then
        show_usage
        exit 1
    fi
    
    local command=$1
    shift
    
    case $command in
        list)
            list_versions
            ;;
        info)
            show_version_info "$1"
            ;;
        latest)
            show_latest
            ;;
        archive)
            archive_version "$1"
            ;;
        status)
            show_status
            ;;
        cleanup)
            cleanup
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"