#!/bin/bash

# TP Translator Version Planning Script
# Usage: ./plan.sh [version] [type]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION_HISTORY="$PROJECT_ROOT/VERSION_HISTORY.md"

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

log_plan() {
    echo -e "${PURPLE}[PLAN]${NC} $1"
}

show_usage() {
    echo "TP Translator Version Planning Tool"
    echo ""
    echo "Usage: $0 [command] [version] [options]"
    echo ""
    echo "Commands:"
    echo "  plan [version] [type]    Create a new version plan"
    echo "  update [version]         Update existing version plan"
    echo "  list                     List all planned versions"
    echo "  status                   Show planning status"
    echo ""
    echo "Version Types:"
    echo "  major       Major release (breaking changes)"
    echo "  minor       Minor release (new features)"
    echo "  patch       Patch release (bug fixes)"
    echo "  alpha       Alpha pre-release"
    echo "  beta        Beta pre-release"
    echo ""
    echo "Examples:"
    echo "  $0 plan 1.3.0 minor     # Plan v1.3.0 minor release"
    echo "  $0 plan 2.0.0 major     # Plan v2.0.0 major release"
    echo "  $0 update 1.3.0         # Update v1.3.0 plan"
    echo ""
}

validate_version() {
    local version=$1
    if [[ ! $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        log_error "Invalid version format. Expected: MAJOR.MINOR.PATCH (e.g., 1.3.0)"
        return 1
    fi
}

get_version_type_description() {
    local type=$1
    case $type in
        major) echo "Major Release (Breaking Changes)" ;;
        minor) echo "Minor Release (New Features)" ;;
        patch) echo "Patch Release (Bug Fixes)" ;;
        alpha) echo "Alpha Pre-release" ;;
        beta) echo "Beta Pre-release" ;;
        *) echo "Unknown Release Type" ;;
    esac
}

get_priority_emoji() {
    local priority=$1
    case $priority in
        high) echo "🔴" ;;
        medium) echo "🟡" ;;
        low) echo "🟢" ;;
        *) echo "⚪" ;;
    esac
}

create_version_plan() {
    local version=$1
    local type=${2:-minor}
    
    validate_version "$version" || return 1
    
    log_plan "Creating version plan for v$version ($type)"
    echo ""
    
    # Gather information interactively
    echo "📝 Version Planning Wizard"
    echo "=========================="
    echo ""
    
    # Basic information
    read -p "📋 Brief description: " brief_desc
    read -p "🎯 Development priority (high/medium/low): " priority
    read -p "📅 Planned release date (YYYY-MM-DD or TBD): " release_date
    
    echo ""
    echo "✨ Planned Features:"
    echo "Enter features one by one (press Enter with empty line to finish)"
    
    features=()
    while true; do
        read -p "- " feature
        if [[ -z "$feature" ]]; then
            break
        fi
        features+=("$feature")
    done
    
    echo ""
    echo "🛠️ Technical Requirements:"
    echo "Enter technical requirements (press Enter with empty line to finish)"
    
    tech_requirements=()
    while true; do
        read -p "- " requirement
        if [[ -z "$requirement" ]]; then
            break
        fi
        tech_requirements+=("$requirement")
    done
    
    echo ""
    echo "⚠️ Notes and Considerations:"
    read -p "Enter any notes: " notes
    
    # Generate plan entry
    local priority_emoji=$(get_priority_emoji "$priority")
    local type_desc=$(get_version_type_description "$type")
    local current_date=$(date +%Y-%m-%d)
    
    # Create temporary plan entry
    local temp_plan="### v$version - $brief_desc (计划中)
**计划发布**: $release_date  
**版本类型**: $type_desc  
**开发优先级**: $priority_emoji $priority  

#### 🎯 规划目标
$brief_desc

#### ✨ 计划功能"
    
    for feature in "${features[@]}"; do
        temp_plan+="\n- [ ] **$feature**"
    done
    
    if [[ ${#tech_requirements[@]} -gt 0 ]]; then
        temp_plan+="\n\n#### 🛠️ 技术要求"
        for req in "${tech_requirements[@]}"; do
            temp_plan+="\n- $req"
        done
    fi
    
    if [[ -n "$notes" ]]; then
        temp_plan+="\n\n#### ⚠️ 注意事项
- $notes"
    fi
    
    temp_plan+="\n"
    
    # Update VERSION_HISTORY.md
    update_version_history "$version" "$type" "$brief_desc" "$release_date" "$temp_plan"
    
    log_success "Version plan for v$version created successfully!"
    log_info "Plan added to: $VERSION_HISTORY"
    
    # Show next steps
    echo ""
    log_info "Next steps:"
    echo "1. Review the plan in VERSION_HISTORY.md"
    echo "2. Start development in src/ directory"
    echo "3. Use './tools/release.sh $version' when ready to release"
}

update_version_history() {
    local version=$1
    local type=$2
    local brief_desc=$3
    local release_date=$4
    local plan_content=$5
    
    # Update the overview table
    local table_entry="| v$version | 📅 Planned | $release_date | $(echo $type | tr '[:lower:]' '[:upper:]') | $brief_desc |"
    
    # Create backup
    cp "$VERSION_HISTORY" "$VERSION_HISTORY.backup"
    
    # Add to overview table (after the current v1.2.0 line)
    sed -i '' "/| v1.2.0 |/a\\
$table_entry" "$VERSION_HISTORY"
    
    # Add detailed plan to the future planning section
    # Find the insertion point (after "### v1.3.0" section or create new section)
    local insertion_marker="## 🚀 未来版本规划"
    
    # Create a temporary file with the new content
    {
        # Copy everything until the insertion marker
        sed "/$insertion_marker/q" "$VERSION_HISTORY"
        echo ""
        echo "$plan_content"
        echo ""
        # Copy the rest, skipping the insertion marker line
        sed "1,/$insertion_marker/d" "$VERSION_HISTORY"
    } > "$VERSION_HISTORY.tmp"
    
    mv "$VERSION_HISTORY.tmp" "$VERSION_HISTORY"
    
    # Update the last modified date
    local current_date=$(date +%Y-%m-%d)
    sed -i '' "s/最后更新: [0-9-]*/最后更新: $current_date/" "$VERSION_HISTORY"
}

update_existing_plan() {
    local version=$1
    
    validate_version "$version" || return 1
    
    # Check if version exists in history
    if ! grep -q "### v$version" "$VERSION_HISTORY"; then
        log_error "Version v$version not found in planning history"
        return 1
    fi
    
    log_info "Updating plan for v$version"
    log_warning "This will open your default editor to modify the plan"
    
    # Find the section and open editor
    local line_num=$(grep -n "### v$version" "$VERSION_HISTORY" | cut -d: -f1)
    
    if command -v code >/dev/null 2>&1; then
        code "$VERSION_HISTORY:$line_num"
    elif [[ -n "$EDITOR" ]]; then
        $EDITOR "$VERSION_HISTORY" "+$line_num"
    else
        nano "+$line_num" "$VERSION_HISTORY"
    fi
    
    log_success "Plan for v$version updated"
}

list_planned_versions() {
    log_info "Planned Versions:"
    echo ""
    
    # Extract planned versions from the table
    grep "| v[0-9]" "$VERSION_HISTORY" | while read line; do
        if [[ $line =~ \|\s*v([0-9]+\.[0-9]+\.[0-9]+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\s*\| ]]; then
            local version="${BASH_REMATCH[1]}"
            local status="${BASH_REMATCH[2]// /}"
            local date="${BASH_REMATCH[3]// /}"
            local type="${BASH_REMATCH[4]// /}"
            local desc="${BASH_REMATCH[5]// /}"
            
            case $status in
                *"Released"*) echo "  ✅ v$version ($type) - $desc" ;;
                *"Planned"*) echo "  📅 v$version ($type) - $desc" ;;
                *"Development"*) echo "  🚧 v$version ($type) - $desc" ;;
                *) echo "  ❓ v$version ($type) - $desc" ;;
            esac
        fi
    done
}

show_planning_status() {
    log_info "Planning Status Summary"
    echo ""
    
    local total_versions=$(grep -c "| v[0-9]" "$VERSION_HISTORY" || echo 0)
    local released_versions=$(grep -c "✅ Released" "$VERSION_HISTORY" || echo 0)
    local planned_versions=$(grep -c "📅 Planned" "$VERSION_HISTORY" || echo 0)
    local dev_versions=$(grep -c "🚧 Development" "$VERSION_HISTORY" || echo 0)
    
    echo "📊 Statistics:"
    echo "   Total versions: $total_versions"
    echo "   Released: $released_versions"
    echo "   In development: $dev_versions"
    echo "   Planned: $planned_versions"
    echo ""
    
    # Show next recommended version
    local latest_version=$(grep "| v[0-9]" "$VERSION_HISTORY" | head -1 | grep -o "v[0-9]\+\.[0-9]\+\.[0-9]\+" | sed 's/v//')
    if [[ -n "$latest_version" ]]; then
        local major=$(echo $latest_version | cut -d. -f1)
        local minor=$(echo $latest_version | cut -d. -f2)
        local patch=$(echo $latest_version | cut -d. -f3)
        
        echo "💡 Suggested next versions:"
        echo "   Patch: v$major.$minor.$((patch + 1)) (bug fixes)"
        echo "   Minor: v$major.$((minor + 1)).0 (new features)"
        echo "   Major: v$((major + 1)).0.0 (breaking changes)"
    fi
    
    # Show last update
    local last_update=$(tail -1 "$VERSION_HISTORY" | grep -o "[0-9-]\{10\}" | tail -1)
    if [[ -n "$last_update" ]]; then
        echo ""
        echo "📅 Last updated: $last_update"
    fi
}

main() {
    if [[ $# -eq 0 ]]; then
        show_usage
        exit 1
    fi
    
    local command=$1
    shift
    
    case $command in
        plan)
            if [[ $# -lt 1 ]]; then
                log_error "Version number required for planning"
                show_usage
                exit 1
            fi
            create_version_plan "$1" "$2"
            ;;
        update)
            if [[ $# -lt 1 ]]; then
                log_error "Version number required for update"
                show_usage
                exit 1
            fi
            update_existing_plan "$1"
            ;;
        list)
            list_planned_versions
            ;;
        status)
            show_planning_status
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