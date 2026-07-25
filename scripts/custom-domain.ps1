[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "High")]
param(
    [ValidateSet("Preflight", "Activate", "Finalize")]
    [string]$Mode = "Preflight",

    [ValidatePattern("^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$")]
    [string]$Domain = "kohler-engineering.com",

    [ValidatePattern("^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")]
    [string]$Repository = "kohlkat/kohlkat.github.io",

    [ValidateRange(1, 60)]
    [int]$WaitForHttpsMinutes = 20
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Domain = $Domain.Trim().TrimEnd(".").ToLowerInvariant()
$repositoryParts = $Repository.Split("/", 2)
$owner = $repositoryParts[0]
$pagesHost = "$owner.github.io"
$challengeHost = "_github-pages-challenge-$owner.$Domain"
$expectedARecords = @(
    "185.199.108.153",
    "185.199.109.153",
    "185.199.110.153",
    "185.199.111.153"
)
$expectedAaaaRecords = @(
    "2606:50c0:8000::153",
    "2606:50c0:8001::153",
    "2606:50c0:8002::153",
    "2606:50c0:8003::153"
)

function Get-DnsRecords {
    param(
        [Parameter(Mandatory)]
        [string]$Name,

        [Parameter(Mandatory)]
        [ValidateSet("A", "AAAA", "CNAME", "TXT", "CAA")]
        [string]$Type
    )

    try {
        return @(
            Resolve-DnsName -Name $Name -Type $Type -DnsOnly -ErrorAction Stop |
                Where-Object { $_.Type -eq $Type }
        )
    }
    catch {
        return @()
    }
}

function Test-DomainRegistration {
    if (-not $Domain.EndsWith(".com", [StringComparison]::OrdinalIgnoreCase)) {
        throw "The built-in RDAP registration check currently supports .com only."
    }

    try {
        $null = Invoke-RestMethod `
            -Method Get `
            -Uri "https://rdap.verisign.com/com/v1/domain/$Domain" `
            -TimeoutSec 30
        return $true
    }
    catch {
        if ($_.Exception.Response) {
            try {
                if ([int]$_.Exception.Response.StatusCode -eq 404) {
                    return $false
                }
            }
            catch {
            }
        }

        throw "RDAP registration check failed: $($_.Exception.Message)"
    }
}

function Test-GitHubCli {
    $null = gh auth status 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub CLI is not authenticated."
    }

    $null = gh repo view $Repository --json nameWithOwner 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub CLI cannot administer $Repository."
    }
}

function Get-PreflightReport {
    $aRecords = @(
        Get-DnsRecords -Name $Domain -Type A |
            ForEach-Object { $_.IPAddress.ToString() }
    )
    $aaaaRecords = @(
        Get-DnsRecords -Name $Domain -Type AAAA |
            ForEach-Object { $_.IPAddress.ToString().ToLowerInvariant() }
    )
    $wwwTargets = @(
        Get-DnsRecords -Name "www.$Domain" -Type CNAME |
            ForEach-Object { $_.NameHost.ToString().TrimEnd(".").ToLowerInvariant() }
    )
    $challengeValues = @(
        Get-DnsRecords -Name $challengeHost -Type TXT |
            ForEach-Object { ($_.Strings -join "").Trim() } |
            Where-Object { $_ }
    )
    $caaValues = @(
        Get-DnsRecords -Name $Domain -Type CAA |
            ForEach-Object { "$($_.Tag) $($_.Value)".ToLowerInvariant() }
    )

    $wildcardName = "github-pages-wildcard-check-$([guid]::NewGuid().ToString('N')).$Domain"
    $wildcardRecords = @(
        Get-DnsRecords -Name $wildcardName -Type A
        Get-DnsRecords -Name $wildcardName -Type AAAA
        Get-DnsRecords -Name $wildcardName -Type CNAME
    )

    $missingARecords = @($expectedARecords | Where-Object { $_ -notin $aRecords })
    $foreignARecords = @($aRecords | Where-Object { $_ -notin $expectedARecords })
    $missingAaaaRecords = @(
        $expectedAaaaRecords |
            Where-Object { $_ -notin $aaaaRecords }
    )
    $foreignAaaaRecords = @(
        $aaaaRecords |
            Where-Object { $_ -notin $expectedAaaaRecords }
    )
    $aaaaSafe = $aaaaRecords.Count -eq 0 -or (
        $missingAaaaRecords.Count -eq 0 -and
        $foreignAaaaRecords.Count -eq 0
    )
    $caaSafe = $caaValues.Count -eq 0 -or @(
        $caaValues | Where-Object { $_ -match "letsencrypt\.org" }
    ).Count -gt 0

    return [pscustomobject]@{
        domain = $Domain
        registered = Test-DomainRegistration
        github_challenge_host = $challengeHost
        github_challenge_present = $challengeValues.Count -gt 0
        apex_a_records = $aRecords
        apex_a_valid = (
            $missingARecords.Count -eq 0 -and
            $foreignARecords.Count -eq 0
        )
        missing_apex_a_records = $missingARecords
        foreign_apex_a_records = $foreignARecords
        apex_aaaa_records = $aaaaRecords
        apex_aaaa_valid_or_absent = $aaaaSafe
        missing_apex_aaaa_records = $missingAaaaRecords
        foreign_apex_aaaa_records = $foreignAaaaRecords
        www_cname_targets = $wwwTargets
        www_cname_valid = (
            $wwwTargets.Count -eq 1 -and
            $wwwTargets[0] -eq $pagesHost
        )
        wildcard_dns_absent = $wildcardRecords.Count -eq 0
        caa_records = $caaValues
        letsencrypt_allowed = $caaSafe
    }
}

function Assert-PreflightReady {
    param(
        [Parameter(Mandatory)]
        [pscustomobject]$Report
    )

    $failures = @()
    if (-not $Report.registered) {
        $failures += "The domain is not registered in Verisign RDAP."
    }
    if (-not $Report.github_challenge_present) {
        $failures += "GitHub ownership TXT is missing at $challengeHost."
    }
    if (-not $Report.apex_a_valid) {
        $failures += "Apex A records do not exactly match GitHub Pages."
    }
    if (-not $Report.apex_aaaa_valid_or_absent) {
        $failures += "Existing apex AAAA records do not exactly match GitHub Pages."
    }
    if (-not $Report.www_cname_valid) {
        $failures += "www CNAME must point only to $pagesHost."
    }
    if (-not $Report.wildcard_dns_absent) {
        $failures += "Wildcard DNS is present and creates a takeover risk."
    }
    if (-not $Report.letsencrypt_allowed) {
        $failures += "Existing CAA records do not allow letsencrypt.org."
    }

    if ($failures.Count -gt 0) {
        throw "Custom-domain preflight failed:`n- $($failures -join "`n- ")"
    }
}

function Set-PagesDomain {
    Test-GitHubCli
    $pages = gh api `
        -H "X-GitHub-Api-Version: 2026-03-10" `
        "repos/$Repository/pages" |
        ConvertFrom-Json

    if ($pages.cname -and $pages.cname -ne $Domain) {
        throw "GitHub Pages already uses the different custom domain '$($pages.cname)'."
    }

    if (-not $PSCmdlet.ShouldProcess(
        "$Repository GitHub Pages",
        "Set custom domain to $Domain"
    )) {
        return
    }

    @{
        cname = $Domain
        build_type = "workflow"
    } |
        ConvertTo-Json -Compress |
        gh api `
            --method PUT `
            -H "X-GitHub-Api-Version: 2026-03-10" `
            "repos/$Repository/pages" `
            --input -
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub Pages custom-domain update failed."
    }

    gh variable set SITE_URL `
        --repo $Repository `
        --body "https://$Domain"
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub SITE_URL variable update failed."
    }

    gh workflow run pages.yml --repo $Repository --ref main
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub Pages workflow dispatch failed."
    }
}

function Enable-PagesHttps {
    Test-GitHubCli
    $deadline = (Get-Date).AddMinutes($WaitForHttpsMinutes)
    $health = $null

    do {
        try {
            $rawHealth = gh api `
                -H "X-GitHub-Api-Version: 2026-03-10" `
                "repos/$Repository/pages/health" 2>$null
            if ($LASTEXITCODE -eq 0 -and $rawHealth) {
                $health = $rawHealth | ConvertFrom-Json
            }
        }
        catch {
            $health = $null
        }

        $pages = gh api `
            -H "X-GitHub-Api-Version: 2026-03-10" `
            "repos/$Repository/pages" |
            ConvertFrom-Json

        $domainReady = (
            $pages.cname -eq $Domain -and
            $pages.protected_domain_state -eq "verified" -and
            $health -and
            $health.domain.is_valid -and
            $health.domain.is_https_eligible -and
            -not $health.domain.caa_error
        )

        if ($domainReady) {
            break
        }

        if ((Get-Date) -ge $deadline) {
            throw "HTTPS is not eligible yet. Keep DNS unchanged and rerun with -Mode Finalize."
        }

        Start-Sleep -Seconds 20
    } while ($true)

    if ($PSCmdlet.ShouldProcess(
        "$Repository GitHub Pages",
        "Enforce HTTPS for $Domain"
    )) {
        @{ https_enforced = $true } |
            ConvertTo-Json -Compress |
            gh api `
                --method PUT `
                -H "X-GitHub-Api-Version: 2026-03-10" `
                "repos/$Repository/pages" `
                --input -
        if ($LASTEXITCODE -ne 0) {
            throw "GitHub Pages HTTPS enforcement failed."
        }
    }

    $robots = Invoke-WebRequest `
        -UseBasicParsing `
        -Uri "https://$Domain/robots.txt" `
        -TimeoutSec 30
    if (
        $robots.StatusCode -ne 200 -or
        $robots.Content -notmatch [regex]::Escape("https://$Domain/sitemap.xml")
    ) {
        throw "The HTTPS site responds, but robots.txt is not canonicalized to $Domain."
    }

    Write-Host "Custom domain is live, verified, and HTTPS-enforced: https://$Domain/"
}

$report = Get-PreflightReport
$report | ConvertTo-Json -Depth 6

if ($Mode -eq "Preflight") {
    Write-Host ""
    Write-Host "Required Squarespace DNS records are documented in docs/CUSTOM_DOMAIN_CUTOVER.md."
    exit 0
}

Assert-PreflightReady -Report $report

if ($Mode -eq "Activate") {
    Set-PagesDomain
}

Enable-PagesHttps
