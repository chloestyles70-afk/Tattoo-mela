(() => {
  const FUNCTION_URL = "https://mtlesmajgaxiaebocybz.supabase.co/functions/v1/tattoo-push-v2";
  const PUBLIC_VAPID_KEY = "BBh7fXfbfgJAcEbLxcBB5gjOmfgr7uyB_qPeibZEiDQiGDLST6oaggfv3oGUvWotkgv5NdoaA2G-o9rMFaFcv3Y";
  const storedUser = localStorage.getItem("tattoo_user") || localStorage.getItem("tattooUser") || "";
  let userId = storedUser === "mela" || storedUser === "you" ? storedUser : null;
  const defaults = { messages: true, memories: true, reactions: true, updates: true, general: true };
  let preferences = { ...defaults };

  const style = document.createElement("style");
  style.textContent = `
    #tattooNotificationBell{position:fixed;right:16px;top:16px;z-index:9998;width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:rgba(23,19,27,.94);color:#f8f2f5;box-shadow:0 8px 24px rgba(0,0,0,.35);backdrop-filter:blur(12px);cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;pointer-events:auto}
    #tattooNotificationPanel{position:fixed;right:14px;top:132px;z-index:9999;width:min(340px,calc(100vw - 28px));padding:16px;border-radius:20px;border:1px solid rgba(255,255,255,.12);background:rgba(23,19,27,.98);color:#f8f2f5;box-shadow:0 18px 50px rgba(0,0,0,.5);font-family:system-ui,-apple-system,sans-serif;display:none}
    #tattooNotificationPanel.show{display:block}
    #tattooNotificationPanel h3{margin:0 0 5px;font-size:17px}
    #tattooNotificationPanel .tattoo-note{color:#b9adb5;font-size:12px;line-height:1.45;margin-bottom:12px}
    .tattoo-push-enable,.tattoo-reaction-btn{border:0;border-radius:12px;padding:10px 12px;background:#e9a8c4;color:#291720;font-weight:700;cursor:pointer}
    .tattoo-push-enable{width:100%;margin-bottom:12px}
    .tattoo-identity{padding:10px 0 12px;border-bottom:1px solid rgba(255,255,255,.08)}
    .tattoo-identity-label{font-size:12px;color:#b9adb5;margin-bottom:8px}
    .tattoo-identity-buttons{display:grid;grid-template-columns:1fr 1fr;gap:7px}
    .tattoo-identity-btn{border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:9px 10px;background:rgba(255,255,255,.05);color:#f8f2f5;font-weight:700;cursor:pointer}
    .tattoo-identity-btn.active{background:#e9a8c4;color:#291720;border-color:#e9a8c4}
    .tattoo-pref{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid rgba(255,255,255,.08);font-size:13px}
    .tattoo-pref input{accent-color:#e9a8c4;width:18px;height:18px}
    .tattoo-status{font-size:11px;color:#b9adb5;margin-top:10px}
    .tattoo-reaction-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.08)}
    .tattoo-reaction-btn{background:rgba(233,168,196,.15);color:#f8f2f5;font-size:12px;font-weight:500;padding:7px 9px}
    .tattoo-reaction-btn.active{background:#e9a8c4;color:#291720}
  `;
  document.head.appendChild(style);

  let bell = document.getElementById("tattooNotificationBell");
  if (!bell) {
    bell = document.createElement("button");
    bell.id = "tattooNotificationBell";
    bell.type = "button";
    bell.setAttribute("aria-label", "Notifications");
    bell.textContent = "🔔";
    document.body.appendChild(bell);
  }

  const panel = document.createElement("section");
  panel.id = "tattooNotificationPanel";
  panel.innerHTML = `
    <h3>💗 Tattoo notifications</h3>
    <div class="tattoo-note">Choose what Tattoo can notify you about, including messages while the app is closed.</div>
    <div class="tattoo-identity">
      <div class="tattoo-identity-label">This device is using:</div>
      <div class="tattoo-identity-buttons">
        <button type="button" class="tattoo-identity-btn" data-notification-identity="you">You</button>
        <button type="button" class="tattoo-identity-btn" data-notification-identity="mela">Mela</button>
      </div>
    </div>
    <button class="tattoo-push-enable" id="tattooPushEnable">Enable background notifications</button>
    <div id="tattooPrefs"></div>
    <div class="tattoo-status" id="tattooPushStatus"></div>
  `;
  document.body.appendChild(panel);

  const prefsEl = panel.querySelector("#tattooPrefs");
  const statusEl = panel.querySelector("#tattooPushStatus");
  const enableBtn = panel.querySelector("#tattooPushEnable");
  const labels = {
    messages: "💬 New messages",
    memories: "📸 New memories",
    reactions: "❤️ Memory reactions",
    updates: "🔔 Important app updates",
    general: "💗 General Tattoo notifications"
  };

  function renderIdentity() {
    panel.querySelectorAll("[data-notification-identity]").forEach(button => {
      button.classList.toggle("active", button.dataset.notificationIdentity === userId);
    });
    if (!userId) {
      statusEl.textContent = "Choose whether this device belongs to You or Mela before enabling notifications.";
      enableBtn.textContent = "Choose identity first";
      enableBtn.disabled = true;
    } else {
      enableBtn.disabled = false;
      enableBtn.textContent = "Enable background notifications";
    }
  }

  function renderPreferences() {
    prefsEl.innerHTML = Object.keys(labels).map(key => `
      <label class="tattoo-pref">
        <span>${labels[key]}</span>
        <input type="checkbox" data-pref="${key}" ${preferences[key] ? "checked" : ""}>
      </label>`).join("");
    prefsEl.querySelectorAll("input").forEach(input => input.addEventListener("change", async () => {
      preferences[input.dataset.pref] = input.checked;
      await savePreferences();
    }));
    renderIdentity();
  }
  async function callFunction(body) {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Notification request failed");
    return data;
  }

  async function loadPreferences() {
    try {
      const response = await fetch(FUNCTION_URL + "?action=preferences&user_id=" + encodeURIComponent(userId));
      if (response.ok) {
        const data = await response.json();
        preferences = { ...defaults, ...(data.preferences || {}) };
      }
    } catch (_) {}
    renderPreferences();
  }

  async function savePreferences() {
    try {
      await callFunction({ action: "preferences", user_id: userId, ...preferences });
      statusEl.textContent = "Notification preferences saved.";
    } catch (error) {
      statusEl.textContent = error.message;
    }
  }

  function base64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = window.atob(base64);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
    return output;
  }

  async function enablePush() {
    const isStandalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
    if (!userId) {
      statusEl.textContent = "Choose whether this device belongs to You or Mela first.";
      return;
    }
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && !isStandalone) {
      statusEl.textContent = "On iPhone, add Tattoo to your Home Screen and open it there before enabling notifications.";
      return;
    }
    if (!("Notification" in window)) { statusEl.textContent = "This browser does not support web notifications."; return; }
    if (Notification.permission === "denied") { statusEl.textContent = "Notifications are blocked. Allow them in your browser settings."; return; }
    const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (permission !== "granted") { statusEl.textContent = "Notification permission was not granted."; return; }
    try {
      if (!("serviceWorker" in navigator)) throw new Error("Background notifications are not supported here.");
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(PUBLIC_VAPID_KEY)
        });
      }
      await callFunction({ action: "subscribe", user_id: userId, subscription: subscription.toJSON() });
      enableBtn.textContent = "Background notifications enabled";
      statusEl.textContent = "You're set. Tattoo can now notify you in the background.";
    } catch (error) { statusEl.textContent = error.message; }
  }

  function addReactionControls(card) {
    if (!card || card.querySelector(".tattoo-reaction-row") || !card.dataset.memoryId) return;
    const row = document.createElement("div");
    row.className = "tattoo-reaction-row";
    ["❤️","💕","💗","💖","🥰","😍","😂","🔥"].forEach(reaction => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tattoo-reaction-btn";
      button.textContent = reaction;
      button.title = "React " + reaction;
      button.addEventListener("click", async () => {
        try {
          await callFunction({ action: "react", user_id: userId, memory_id: card.dataset.memoryId, reaction });
          row.querySelectorAll("button").forEach(b => b.classList.remove("active"));
          button.classList.add("active");
        } catch (error) {
          alert("Could not react to this memory: " + error.message);
        }
      });
      row.appendChild(button);
    });
    card.appendChild(row);
  }

  function watchMemoryCards() {
    document.querySelectorAll(".memory[data-memory-id]").forEach(addReactionControls);
    if (window.MutationObserver) {
      const observer = new MutationObserver(() => document.querySelectorAll(".memory[data-memory-id]").forEach(addReactionControls));
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  bell.addEventListener("click", () => panel.classList.toggle("show"));
  document.addEventListener("click", event => {
    if (!panel.contains(event.target) && event.target !== bell) panel.classList.remove("show");
  });

  panel.querySelectorAll("[data-notification-identity]").forEach(button => {
    button.addEventListener("click", () => {
      userId = button.dataset.notificationIdentity;
      localStorage.setItem("tattoo_user", userId);
      localStorage.setItem("tattooUser", userId);
      renderIdentity();
      statusEl.textContent = (userId === "mela" ? "Mela" : "You") + " is selected for this device. Tap Enable to register this device.";
      loadPreferences();
    });
  });

  enableBtn.addEventListener("click", enablePush);

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./service-worker.js").catch(error => console.warn("Tattoo service worker:", error));
  renderPreferences();
  loadPreferences();
  watchMemoryCards();
})();
