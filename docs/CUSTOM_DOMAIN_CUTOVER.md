# `kohler-engineering.com` secure cutover

The site remains canonical at `https://kohlkat.github.io/` until the domain is
owned, verified, pointed to GitHub Pages, and eligible for HTTPS. Do not add a
`CNAME` file to this repository; Pages is deployed through a custom workflow,
so GitHub stores the custom-domain setting outside the artifact.

## Security before DNS

1. Buy `kohler-engineering.com` from Squarespace Domains.
2. Enable account two-factor authentication, registrar lock, auto-renew, and
   Whois privacy.
3. Keep Squarespace nameservers so its built-in DNSSEC remains enabled.
4. In GitHub profile settings, open **Pages → Add a domain**, enter
   `kohler-engineering.com`, and copy the generated TXT value.
5. Add that TXT value at
   `_github-pages-challenge-kohlkat.kohler-engineering.com` in Squarespace DNS.
6. Complete GitHub's **Verify** action and keep the TXT record permanently.

Never create wildcard DNS records such as `*.kohler-engineering.com`.

## Squarespace DNS records

Add these under **Domains → kohler-engineering.com → DNS → DNS Settings →
Custom Records**:

| Type | Host | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `kohlkat.github.io` |

If the DNS zone already contains any CAA record, it must allow
`letsencrypt.org`; otherwise GitHub cannot issue the HTTPS certificate. Do not
delete MX, SPF, DKIM, or DMARC records used by future email.

Squarespace Domains does not expose an official registrar/DNS CLI for this
workflow, so DNS entry and GitHub's profile-level verification are the two
intentional human steps.

## CLI preflight and activation

From the repository root:

```powershell
.\scripts\custom-domain.ps1 -Mode Preflight
```

The preflight checks registration through Verisign RDAP, the retained GitHub
ownership TXT, all GitHub Pages A records, optional-but-exact AAAA records,
`www` CNAME, wildcard absence, and CAA compatibility.

Only when every check passes:

```powershell
.\scripts\custom-domain.ps1 -Mode Activate
```

Activation:

1. Sets the GitHub Pages custom domain through the versioned REST API.
2. Changes the public `SITE_URL` build variable to the custom HTTPS origin.
3. dispatches the pinned GitHub Pages workflow.
4. waits for GitHub's protected-domain and certificate health checks.
5. enforces HTTPS.
6. verifies the custom-domain `robots.txt`.

If certificate issuance takes longer than the bounded wait, keep DNS unchanged
and rerun:

```powershell
.\scripts\custom-domain.ps1 -Mode Finalize -WaitForHttpsMinutes 60
```

## Google follow-up

After HTTPS is live:

1. Add a Search Console **Domain property** for `kohler-engineering.com` using
   Google's DNS TXT token.
2. Keep the existing `https://kohlkat.github.io/` URL-prefix property for
   migration history.
3. Submit `https://kohler-engineering.com/sitemap.xml`.
4. Update the GA4 web stream default URL to
   `https://kohler-engineering.com/`.
5. Confirm GitHub redirects the old `github.io` URL and `www` to the canonical
   HTTPS apex.
