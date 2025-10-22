$files = @(
  "client\components\ui\LocationSearchWithRadius.tsx",
  "client\components\ui\ProfileAvatar.tsx",
  "client\components\ui\MultiCityAutocomplete.tsx",
  "client\components\ui\FavoriteButton.tsx",
  "client\components\ui\CityAutocomplete.tsx",
  "client\components\ui\AddressAutocomplete.tsx",
  "client\components\ui\ProfileImageUploader.tsx",
  "client\components\search-ads\SearchAdDetails.tsx",
  "client\components\search-ads\MySearches.tsx",
  "client\components\search-ads\EditSearchAdForm.tsx",
  "client\components\property\PropertyManager.tsx",
  "client\components\notifications\NotificationBell.tsx",
  "client\components\dashboard-apporteur\Home.tsx",
  "client\components\contract\ContractManagement.tsx",
  "client\components\chat\ChatSidebar.tsx",
  "client\components\chat\MessageBubble.tsx",
  "client\components\chat\MessageInput.tsx",
  "client\components\chat\ui\MessageTime.tsx",
  "client\components\collaboration\shared\ActivityManager.tsx",
  "client\components\collaboration\overall-status\OverallStatusManager.tsx",
  "client\components\collaboration\progress-tracking\ProgressStatusModal.tsx",
  "client\components\collaboration\progress-tracking\StepValidationModal.tsx",
  "client\components\collaboration\CollaborationCard.tsx",
  "client\components\collaboration\CollaborationList.tsx",
  "client\components\appointments\BookAppointmentModal.tsx",
  "client\components\appointments\AvailabilityManager.tsx"
)

foreach ($file in $files) {
  $path = "c:\Users\karan\Desktop\mon-hub-immo\$file"
  if (Test-Path $path) {
    $content = Get-Content $path -Raw
    $modified = $false
    
    # Replace console.error with logger.error
    if ($content -match "console\.error") {
      $content = $content -replace "console\.error", "logger.error"
      $modified = $true
    }
    
    # Replace console.log with logger.debug
    if ($content -match "console\.log") {
      $content = $content -replace "console\.log", "logger.debug"
      $modified = $true
    }
    
    # Replace console.warn with logger.warn
    if ($content -match "console\.warn") {
      $content = $content -replace "console\.warn", "logger.warn"
      $modified = $true
    }
    
    if ($modified) {
      Set-Content $path -Value $content -NoNewline
      
      # Add logger import if not present
      $content = Get-Content $path -Raw
      if ($content -notmatch "import.*logger.*from.*@/lib/utils/logger") {
        $lines = Get-Content $path
        $importIndex = 0
        for ($i = 0; $i -lt $lines.Count; $i++) {
          if ($lines[$i] -match "^import ") {
            $importIndex = $i
          }
          if ($lines[$i] -match "^$" -and $importIndex -gt 0) {
            break
          }
        }
        $lines = @($lines[0..$importIndex]) + "import { logger } from '@/lib/utils/logger';" + @($lines[($importIndex+1)..($lines.Count-1)])
        Set-Content $path -Value ($lines -join "`n")
      }
      
      Write-Host " Fixed: $file"
    }
  }
}
Write-Host "`n Console.log replacement complete!"
