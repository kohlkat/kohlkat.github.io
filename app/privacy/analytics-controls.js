"use client";

import { useEffect, useState } from "react";

const consentKey = "sage-analytics-consent";

export default function AnalyticsControls() {
  const [consent, setConsent] = useState("loading");

  useEffect(() => {
    setConsent(window.localStorage.getItem(consentKey) ?? "unset");
  }, []);

  const chooseConsent = (value) => {
    window.localStorage.setItem(consentKey, value);
    setConsent(value);
    window.location.reload();
  };

  return (
    <div className="privacy-controls">
      <p>
        Current browser preference:{" "}
        <strong>
          {consent === "granted"
            ? "analytics allowed"
            : consent === "denied"
              ? "analytics declined"
              : consent === "loading"
                ? "checking"
                : "not selected"}
        </strong>
      </p>
      <div>
        <button type="button" onClick={() => chooseConsent("denied")}>
          Decline analytics
        </button>
        <button
          className="analytics-accept"
          type="button"
          onClick={() => chooseConsent("granted")}
        >
          Allow analytics
        </button>
      </div>
    </div>
  );
}
