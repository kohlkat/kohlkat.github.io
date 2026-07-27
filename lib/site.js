const defaultSiteOrigin = "https://sage-public-evidence.vercel.app";

function resolveSiteOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || defaultSiteOrigin;
  const url = new URL(configuredOrigin);

  if (url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS.");
  }

  if (
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an HTTPS origin without credentials, path, query, or fragment.",
    );
  }

  return url.origin;
}

export const siteOrigin = resolveSiteOrigin();
export const siteUrl = `${siteOrigin}/`;
