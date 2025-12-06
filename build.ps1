<#
Simple build helper for Windows.
If CMake is available it will configure & build the project.
Otherwise it will compile the non-Qt test harness directly with g++.

Usage: PowerShell
  .\build.ps1        # builds using cmake if present, else uses g++ fallback
#>

function Test-CommandExists { param([string]$cmd) return (Get-Command $cmd -ErrorAction SilentlyContinue) -ne $null }

Write-Host "== task-manager build helper ==" -ForegroundColor Cyan

if (Test-CommandExists cmake) {
    Write-Host "CMake detected — configuring and building (Release)." -ForegroundColor Green
    cmake -S . -B build
    if ($LASTEXITCODE -ne 0) { Write-Error "CMake configure failed."; exit $LASTEXITCODE }
    cmake --build build --config Release -- -j
    if ($LASTEXITCODE -ne 0) { Write-Error "CMake build failed."; exit $LASTEXITCODE }
    Write-Host "Build complete. Use: .\\build\\test_scheduler.exe or .\\build\\task_manager_gui.exe (if Qt built)" -ForegroundColor Green
    exit 0
}

Write-Host "CMake not found — falling back to direct g++ compile of test harness." -ForegroundColor Yellow
if (-not (Test-CommandExists g++)) {
    Write-Error "g++ not found in PATH. Install GCC/MinGW or MSYS2 and retry, or install CMake." ; exit 1
}

$cmd = 'g++ -std=c++17 test_scheduler.cpp scheduler.cpp -o test_scheduler.exe'
Write-Host "Running: $cmd" -ForegroundColor Gray
Invoke-Expression $cmd
if ($LASTEXITCODE -ne 0) { Write-Error "g++ build failed."; exit $LASTEXITCODE }

Write-Host "Build succeeded: .\\test_scheduler.exe" -ForegroundColor Green
Exit 0
