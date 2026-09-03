(function () {
  "use strict";

  const STORAGE_KEY = "fabr-free-seat-onboarding-v2";
  let lastFocusedElement = null;

  function readQuota() {
    try {
      const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const cashBalance = Number(state.balance || 0);
      const activityGiftBalance = Number(state.aiActivityGiftBalance || state.tokenVoucher || 0);
      const seatGiftBalance = Math.max(Number(state.paidSeats || 0), 0) * 480;
      return cashBalance + activityGiftBalance + seatGiftBalance;
    } catch (_) {
      return 0;
    }
  }

  function assistantName() {
    return /coding/i.test(location.pathname) ? "编程助手" : "项目助手";
  }

  function createDialog() {
    const overlay = document.createElement("div");
    overlay.className = "ai-quota-overlay";
    overlay.id = "aiQuotaOverlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <section class="ai-quota-dialog" role="dialog" aria-modal="true" aria-labelledby="aiQuotaTitle" aria-describedby="aiQuotaDescription">
        <header class="ai-quota-dialog-head">
          <div class="ai-quota-dialog-icon" aria-hidden="true">AI</div>
          <div class="ai-quota-dialog-copy">
            <span class="ai-quota-role">额度提醒</span>
            <h2 id="aiQuotaTitle">企业账户暂无可用 AI Token 额度</h2>
            <p id="aiQuotaDescription">本次请求尚未发送。补充额度后，即可继续使用${assistantName()}。</p>
          </div>
          <button class="ai-quota-dialog-close" type="button" aria-label="关闭额度提示">×</button>
        </header>
        <div class="ai-quota-explanation">
          <span>当前企业账户没有可用于 AI 调用的账户余额或赠送额度。</span>
        </div>
        <div class="ai-quota-dialog-body">
          <a class="ai-quota-choice primary" href="../10席免费注册引导页面设计/balance-ai.html?action=recharge">
            <span class="ai-quota-choice-icon money" aria-hidden="true">企</span>
            <span><b>如果您是企业管理员</b><small>请前往“充值与余额”完成充值，最低 50 元起充。</small></span>
            <span class="ai-quota-choice-action">去充值</span>
          </a>
          <div class="ai-quota-member-card">
            <span class="ai-quota-member-icon" aria-hidden="true">员</span>
            <span><b>如果您是企业成员（子账户）</b><small>请联系企业管理员为企业账户充值，额度到账后即可继续使用。</small></span>
          </div>
        </div>
      </section>`;
    document.body.appendChild(overlay);
    overlay.querySelector(".ai-quota-dialog-close").addEventListener("click", closeDialog);
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closeDialog();
    });
    return overlay;
  }

  function getDialog() {
    return document.getElementById("aiQuotaOverlay") || createDialog();
  }

  function openDialog() {
    const overlay = getDialog();
    lastFocusedElement = document.activeElement;
    overlay.hidden = false;
    overlay.querySelector(".ai-quota-dialog-close").focus();
  }

  function closeDialog() {
    const overlay = document.getElementById("aiQuotaOverlay");
    if (!overlay) return;
    overlay.hidden = true;
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
  }

  function shouldBlock() {
    return readQuota() <= 0;
  }

  document.addEventListener("click", function (event) {
    const sendButton = event.target.closest(".send-btn");
    if (!sendButton || !shouldBlock()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openDialog();
  }, true);

  document.addEventListener("keydown", function (event) {
    const openOverlay = document.getElementById("aiQuotaOverlay");
    if (event.key === "Escape" && openOverlay && !openOverlay.hidden) {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== "Enter" || event.shiftKey || !event.target.matches(".composer textarea") || !shouldBlock()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openDialog();
  }, true);

  if (new URLSearchParams(location.search).get("preview") === "ai-quota") {
    window.setTimeout(openDialog, 180);
  }
})();
