/**
 * Injected script for the Visual Bug Reporter & Sticky-Note Feedback Widget.
 * Injected automatically into HTML responses so clients & friends can click
 * on any element and drop pinpoint feedback.
 */
export const FEEDBACK_WIDGET_SCRIPT = `
<!-- __peer_port_feedback_widget__ -->
<style>
  #__pf_badge {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 2147483647;
    background: #0d1117;
    color: #e6edf3;
    border: 1px solid rgba(88, 166, 255, 0.4);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(88, 166, 255, 0.2);
    border-radius: 9999px;
    padding: 10px 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    user-select: none;
  }
  #__pf_badge:hover {
    transform: translateY(-2px);
    background: #161b22;
    border-color: #58a6ff;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6), 0 0 16px rgba(88, 166, 255, 0.4);
  }
  #__pf_badge.active {
    background: #238636;
    border-color: #3fb950;
    color: #ffffff;
  }
  .__pf_highlight {
    outline: 2px dashed #58a6ff !important;
    outline-offset: 2px !important;
    cursor: crosshair !important;
  }
  #__pf_modal_overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 2147483647;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  #__pf_modal {
    background: #161b22;
    color: #e6edf3;
    border: 1px solid rgba(240, 246, 252, 0.15);
    border-radius: 14px;
    padding: 22px;
    max-width: 420px;
    width: 100%;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.7);
  }
  #__pf_modal h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  #__pf_modal .meta {
    font-size: 11px;
    color: #8b949e;
    background: #0d1117;
    padding: 6px 10px;
    border-radius: 6px;
    margin-bottom: 14px;
    font-family: monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  #__pf_modal textarea {
    width: 100%;
    box-sizing: border-box;
    background: #0d1117;
    border: 1px solid rgba(240, 246, 252, 0.2);
    border-radius: 8px;
    color: #fff;
    padding: 10px;
    font-size: 14px;
    resize: vertical;
    min-height: 80px;
    outline: none;
    margin-bottom: 14px;
  }
  #__pf_modal textarea:focus {
    border-color: #58a6ff;
  }
  #__pf_modal .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  #__pf_modal button {
    padding: 8px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
  }
  #__pf_modal .cancel-btn {
    background: transparent;
    color: #8b949e;
  }
  #__pf_modal .cancel-btn:hover { color: #fff; }
  #__pf_modal .submit-btn {
    background: #238636;
    color: #fff;
  }
  #__pf_modal .submit-btn:hover { background: #2ea043; }
</style>

<div id="__pf_badge" title="Click on any element to leave feedback">
  <span>📌</span>
  <span id="__pf_badge_text">Drop Comment</span>
</div>

<div id="__pf_modal_overlay">
  <div id="__pf_modal">
    <h3>📌 Add Sticky Note</h3>
    <div class="meta" id="__pf_meta_selector">Selected: &lt;body&gt;</div>
    <textarea id="__pf_comment_input" placeholder="e.g. Change this button to dark blue, text is overlapping on my phone..."></textarea>
    <div class="actions">
      <button class="cancel-btn" id="__pf_cancel_btn">Cancel</button>
      <button class="submit-btn" id="__pf_submit_btn">Send to Developer</button>
    </div>
  </div>
</div>

<script>
(function() {
  let inspecting = false;
  let hoveredEl = null;
  let selectedTarget = null;

  const badge = document.getElementById('__pf_badge');
  const badgeText = document.getElementById('__pf_badge_text');
  const overlay = document.getElementById('__pf_modal_overlay');
  const metaText = document.getElementById('__pf_meta_selector');
  const commentInput = document.getElementById('__pf_comment_input');
  const cancelBtn = document.getElementById('__pf_cancel_btn');
  const submitBtn = document.getElementById('__pf_submit_btn');

  function getSelector(el) {
    if (!el || el === document.body || el === document.documentElement) return 'body';
    if (el.id) return '#' + el.id;
    let name = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
      const cls = el.className.trim().split(/\\s+/)[0];
      if (cls && !cls.startsWith('__pf')) name += '.' + cls;
    }
    return name;
  }

  function toggleInspect() {
    inspecting = !inspecting;
    if (inspecting) {
      badge.classList.add('active');
      badgeText.textContent = 'Click on any element...';
      document.body.style.cursor = 'crosshair';
    } else {
      badge.classList.remove('active');
      badgeText.textContent = 'Drop Comment';
      document.body.style.cursor = '';
      if (hoveredEl) {
        hoveredEl.classList.remove('__pf_highlight');
        hoveredEl = null;
      }
    }
  }

  badge.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleInspect();
  });

  document.addEventListener('mouseover', (e) => {
    if (!inspecting) return;
    if (e.target.closest('#__pf_badge') || e.target.closest('#__pf_modal_overlay')) return;
    if (hoveredEl && hoveredEl !== e.target) {
      hoveredEl.classList.remove('__pf_highlight');
    }
    hoveredEl = e.target;
    hoveredEl.classList.add('__pf_highlight');
  }, true);

  document.addEventListener('click', (e) => {
    if (!inspecting) return;
    if (e.target.closest('#__pf_badge') || e.target.closest('#__pf_modal_overlay')) return;

    e.preventDefault();
    e.stopPropagation();

    selectedTarget = e.target;
    const selector = getSelector(selectedTarget);
    const textPreview = (selectedTarget.innerText || '').trim().substring(0, 35);

    metaText.textContent = selector + (textPreview ? ' ("' + textPreview + '")' : '');
    overlay.style.display = 'flex';
    commentInput.value = '';
    commentInput.focus();

    toggleInspect();
  }, true);

  cancelBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  submitBtn.addEventListener('click', async () => {
    const comment = commentInput.value.trim();
    if (!comment) return;

    const payload = {
      comment: comment,
      selector: getSelector(selectedTarget),
      elementText: (selectedTarget ? selectedTarget.innerText : '').trim().substring(0, 80),
      url: window.location.pathname + window.location.search,
      screenSize: window.innerWidth + 'x' + window.innerHeight,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    };

    submitBtn.textContent = 'Sending...';
    try {
      await fetch('/__peer_feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      badgeText.textContent = '✔ Sent!';
      setTimeout(() => { badgeText.textContent = 'Drop Comment'; }, 2500);
    } catch (err) {
      alert('Failed to send feedback: ' + err.message);
    }

    overlay.style.display = 'none';
    submitBtn.textContent = 'Send to Developer';
  });
})();
</script>
`;

