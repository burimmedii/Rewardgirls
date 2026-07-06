// ═══════════════════════════════════════════════════════════════
//  PUT YOUR SHEIN AFFILIATE LINK HERE ↓↓↓
// ═══════════════════════════════════════════════════════════════
const AFFILIATE_CONFIG = {
  url: "https://linkthem.net/aff_c?offer_id=1304&aff_id=22551",
  buttonText: "Start Surveys & Claim Gift Card",
};

const ELIGIBLE_COUNTRIES = {
  US: "the USA",
  GB: "the UK",
  CA: "Canada",
  AU: "Australia",
};

const COUNTER_MIN = 150;
const COUNTER_MAX = 2500;

let userCountryCode = null;
let userEligible = false;

const affiliateButtonIds = [
  "hero-affiliate-btn",
  "header-affiliate-btn",
  "footer-affiliate-btn",
];

function getDailyGiftCardCount() {
  const now = new Date(
  new Date().toLocaleString("en-US", {
    timeZone: "Pacific/Pago_Pago"
  })
);
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const dayProgress = (now - midnight) / (24 * 60 * 60 * 1000);
  return Math.floor(COUNTER_MIN + dayProgress * (COUNTER_MAX - COUNTER_MIN));
}

function setupLiveCounter() {
  const counterEl = document.getElementById("gift-card-count");
  if (!counterEl) return;

  function update() {
    const base = getDailyGiftCardCount();
    const jitter = Math.floor(Math.random() * 4);
    counterEl.textContent = (base + jitter).toLocaleString();
  }

  update();
  window.setInterval(update, 8000);
}

async function detectCountry() {
  try {
    const response = await fetch("https://www.geoplugin.net/json.gp");
    if (!response.ok) throw new Error("GeoPlugin failed");
    const data = await response.json();
    return data.geoplugin_countryCode || null;
  } catch {
    try {
      const fallback = await fetch("https://api.country.is/");
      if (!fallback.ok) throw new Error("Fallback failed");
      const data = await fallback.json();
      return data.country || null;
    } catch {
      return null;
    }
  }
}

function renderEligibilityBox(code, eligible) {
  const box = document.getElementById("eligibility-box");
  if (!box) return;

  box.classList.remove("eligible", "not-eligible", "unknown");

  if (!code) {
    box.classList.add("unknown");
    box.innerHTML =
      "<p>We couldn't detect your country. The offer may only work in the USA, UK, Canada, and Australia.</p>";
    return;
  }

  if (eligible) {
    const countryName = ELIGIBLE_COUNTRIES[code];
    box.classList.add("eligible");
    box.innerHTML = `<p>✅ You're eligible! You can get a SHEIN gift card — detected location: <strong>${countryName}</strong>.</p>`;
  } else {
    box.classList.add("not-eligible");
    box.innerHTML =
      "<p>❌ You're not eligible. This offer only works in the USA, UK, Canada, and Australia. The button is disabled for your region.</p>";
  }
}

function setAffiliateButtonsEnabled(enabled) {
  affiliateButtonIds.forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    if (enabled) {
      btn.href = AFFILIATE_CONFIG.url;
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
      btn.classList.remove("btn-disabled");
      btn.removeAttribute("aria-disabled");
      btn.onclick = null;

      if (id === "hero-affiliate-btn") {
        btn.innerHTML = `${AFFILIATE_CONFIG.buttonText} <span class="btn-arrow" aria-hidden="true">→</span>`;
      }
    } else {
      btn.href = "#";
      btn.removeAttribute("target");
      btn.classList.add("btn-disabled");
      btn.setAttribute("aria-disabled", "true");
      btn.onclick = (e) => {
        e.preventDefault();
        showBlockedMessage();
      };
    }
  });
}

function showBlockedMessage() {
  const feedback = document.getElementById("action-feedback");
  if (feedback) {
    feedback.textContent = "Sorry — this offer is only available in the USA, UK, Canada, and Australia.";
    window.setTimeout(() => {
      feedback.textContent = "";
    }, 4000);
  }
}

async function setupGeoEligibility() {
  userCountryCode = await detectCountry();
  userEligible = userCountryCode !== null && userCountryCode in ELIGIBLE_COUNTRIES;

  renderEligibilityBox(userCountryCode, userEligible);
  setAffiliateButtonsEnabled(userEligible);
}

function setupYear() {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}

setupLiveCounter();
setupYear();
setupGeoEligibility();
