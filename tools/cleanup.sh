#!/bin/bash

# TP Translator Cleanup Script
# Cleans up legacy and duplicate release directories

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

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
    echo "TP Translator Cleanup Tool"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --dry-run    Show what would be cleaned without actually deleting"
    echo "  --force      Skip confirmation prompts"
    echo "  --help       Show this help"
    echo ""
    echo "This script will:"
    echo "  1. Archive legacy release directories"
    echo "  2. Remove duplicate zip files"
    echo "  3. Clean up temporary files"
    echo "  4. Organize remaining files"
    echo ""
}

# Legacy directories to be archived
LEGACY_DIRS=(
    "release"
    "releases"
    "tp-translator-release" 
    "test-version"
    "cube-translator-v1.1.0"
    "cube-translator-v1.1.3-最新版 2"
    "cube-translator-v1.1.5-自动重试版"
)

# Legacy files to be archived
LEGACY_FILES=(
    "*.zip"
    "TP-Translator-v*"
)

cleanup_legacy_directories() {
    local dry_run=$1
    log_info "Cleaning up legacy directories..."
    
    for dir in "${LEGACY_DIRS[@]}"; do
        local full_path="$PROJECT_ROOT/$dir"
        if [[ -d "$full_path" ]]; then
            if [[ "$dry_run" == "true" ]]; then
                log_warning "[DRY RUN] Would archive: $dir"
            else
                log_info "Archiving legacy directory: $dir"
                mkdir -p "$PROJECT_ROOT/archives/legacy"
                mv "$full_path" "$PROJECT_ROOT/archives/legacy/"
                log_success "Archived: $dir"
            fi
        fi
    done
}

cleanup_legacy_files() {
    local dry_run=$1
    log_info "Cleaning up legacy files and directories..."
    
    cd "$PROJECT_ROOT"
    
    # Handle zip files
    for zip_file in TP-Translator-*.zip; do
        if [[ -f "$zip_file" ]]; then
            if [[ "$dry_run" == "true" ]]; then
                log_warning "[DRY RUN] Would archive: $zip_file"
            else
                log_info "Archiving legacy zip: $zip_file"
                mkdir -p "archives/legacy-packages"
                mv "$zip_file" "archives/legacy-packages/"
                log_success "Archived: $zip_file"
            fi
        fi
    done
    
    # Handle TP-Translator directories
    for tp_dir in TP-Translator-*; do
        if [[ -d "$tp_dir" && "$tp_dir" != "TP-Translator-v1.2.0-稳定版" ]]; then
            if [[ "$dry_run" == "true" ]]; then
                log_warning "[DRY RUN] Would archive: $tp_dir"
            else
                log_info "Archiving legacy directory: $tp_dir"
                mkdir -p "archives/legacy"
                mv "$tp_dir" "archives/legacy/"
                log_success "Archived: $tp_dir"
            fi
        fi
    done
    
    cd - >/dev/null
}

cleanup_system_files() {
    local dry_run=$1
    log_info "Cleaning up system files..."
    
    if [[ "$dry_run" == "true" ]]; then
        log_warning "[DRY RUN] Would remove .DS_Store files"
        find "$PROJECT_ROOT" -name ".DS_Store" -type f 2>/dev/null | head -5 | while read file; do
            echo "   Would remove: $file"
        done
    else
        local count=$(find "$PROJECT_ROOT" -name ".DS_Store" -type f -delete 2>/dev/null | wc -l || echo 0)
        log_success "Removed $count .DS_Store files"
    fi
}

organize_source_files() {
    local dry_run=$1
    log_info "Organizing source files..."
    
    # Create src directory if it doesn't exist
    mkdir -p "$PROJECT_ROOT/src"
    
    # Move main source files to src if they exist in root
    local files_to_move=("code.js" "ui.html" "manifest.json" "ui.js")
    
    for file in "${files_to_move[@]}"; do
        if [[ -f "$PROJECT_ROOT/$file" ]]; then
            if [[ "$dry_run" == "true" ]]; then
                log_warning "[DRY RUN] Would move $file to src/"
            else
                log_info "Moving $file to src/"
                mv "$PROJECT_ROOT/$file" "$PROJECT_ROOT/src/"
                log_success "Moved: $file"
            fi
        fi
    done
}

create_directory_structure() {
    local dry_run=$1
    log_info "Creating standard directory structure..."
    
    local dirs=("src" "releases_new" "archives/legacy" "archives/versions" "archives/legacy-packages" "tools")
    
    for dir in "${dirs[@]}"; do
        if [[ ! -d "$PROJECT_ROOT/$dir" ]]; then
            if [[ "$dry_run" == "true" ]]; then
                log_warning "[DRY RUN] Would create: $dir"
            else
                mkdir -p "$PROJECT_ROOT/$dir"
                log_success "Created: $dir"
            fi
        fi
    done
}

finalize_structure() {
    log_info "Finalizing new structure..."
    
    # Rename releases_new to releases
    if [[ -d "$PROJECT_ROOT/releases_new" && ! -d "$PROJECT_ROOT/releases" ]]; then
        mv "$PROJECT_ROOT/releases_new" "$PROJECT_ROOT/releases"
        log_success "Renamed releases_new to releases"
    fi
    
    # Create latest symlink if it doesn't exist
    if [[ -d "$PROJECT_ROOT/releases/v1.2.0" && ! -L "$PROJECT_ROOT/releases/latest" ]]; then
        cd "$PROJECT_ROOT/releases"
        ln -sf "v1.2.0" latest
        cd - >/dev/null
        log_success "Created latest symlink pointing to v1.2.0"
    fi
}

show_summary() {
    log_info "Cleanup Summary"
    echo ""
    echo "📁 New Directory Structure:"
    tree "$PROJECT_ROOT" -L 2 2>/dev/null || find "$PROJECT_ROOT" -maxdepth 2 -type d | sort
    echo ""
    
    log_info "✅ Cleanup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Review archived files in archives/ directory"
    echo "2. Update your source files in src/ directory"
    echo "3. Use ./tools/release.sh to create new releases"
    echo "4. Use ./tools/version.sh to manage versions"
}

main() {
    local dry_run=false
    local force=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                dry_run=true
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    if [[ "$dry_run" == "true" ]]; then
        log_warning "🔍 DRY RUN MODE - No files will be modified"
        echo ""
    fi
    
    # Confirmation if not in dry run mode and not forced
    if [[ "$dry_run" == "false" && "$force" == "false" ]]; then
        echo "This will clean up and reorganize your project structure."
        echo "Legacy files will be moved to archives/ directory."
        echo ""
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Cleanup cancelled."
            exit 0
        fi
    fi
    
    # Run cleanup steps
    create_directory_structure "$dry_run"
    cleanup_legacy_directories "$dry_run"
    cleanup_legacy_files "$dry_run"
    cleanup_system_files "$dry_run"
    organize_source_files "$dry_run"
    
    if [[ "$dry_run" == "false" ]]; then
        finalize_structure
        show_summary
    else
        log_info "🔍 Dry run completed - no changes made"
    fi
}

main "$@"