"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const consentKey = "sage-analytics-consent";
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
const analyticsConfigured = /^G-[A-Z0-9]+$/i.test(measurementId ?? "");

export default function GoogleAnalytics() {
  const [consent, setConsent] = useState("loading");

  useEffect(() => {
    setConsent(window.localStorage.getItem(consentKey) ?? "unset");
  }, []);

  if (!analyticsConfigured) {
    return null;
  }

  const chooseConsent = (value) => {
    window.localStorage.setItem(consentKey, value);
    setConsent(value);
  };

  return (
    <>
      {consent === "granted" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="sage-google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${measurementId}', {
                allow_google_signals: false,
                allow_ad_personalization_signals: false
              });
            `}
          </Script>
        </>
      ) : null}

      {consent === "unset" ? (
        <aside
          aria-label="Analytics preference"
          aria-live="polite"
          className="analytics-notice"
        >
          <p>
            Allow privacy-conscious analytics to help improve this project site?
            No advertising signals are enabled.{" "}
            <a href="/privacy/">Privacy details</a>
          </p>
          <div>
            <button type="button" onClick={() => chooseConsent("denied")}>
              No thanks
            </button>
            <button
              className="analytics-accept"
              type="button"
              onClick={() => chooseConsent("granted")}
            >
              Allow analytics
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
