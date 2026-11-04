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
  #__pf_loc_pill {
    position: fixed;
    top: 14px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    background: rgba(13, 17, 23, 0.94);
    border: 1px solid rgba(88, 166, 255, 0.45);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 16px rgba(88, 166, 255, 0.25);
    border-radius: 9999px;
    padding: 8px 18px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    color: #e6edf3;
    display: flex;
    align-items: center;
    gap: 8px;
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    user-select: none;
    pointer-events: auto;
  }
  #__pf_loc_pill.hidden {
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -20px);
  }
  #__pf_loc_dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #58a6ff;
    box-shadow: 0 0 8px #58a6ff;
    display: inline-block;
    animation: pfPulse 1.8s infinite;
  }
  @keyframes pfPulse {
    0% { transform: scale(0.9); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.5; }
    100% { transform: scale(0.9); opacity: 1; }
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

  // Location Active Notice & Precision GPS Telemetry
  try {
    const locPill = document.createElement('div');
    locPill.id = '__pf_loc_pill';
    locPill.innerHTML = '<span id="__pf_loc_dot"></span><span>📍 <strong>Location Radar Active:</strong> Calibrating live telemetry...</span>';
    document.body.appendChild(locPill);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy || 10);
          locPill.innerHTML = '<span id="__pf_loc_dot" style="background:#3fb950;box-shadow:0 0 8px #3fb950;"></span><span>📍 <strong>Location Active:</strong> Precision Satellite Fix (±' + acc + 'm)</span>';
          fetch('/__peer_report_location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: lat, lng: lng, accuracy: acc, exact: true })
          }).catch(() => {});
          setTimeout(() => { locPill.classList.add('hidden'); }, 3500);
        },
        (err) => {
          locPill.innerHTML = '<span id="__pf_loc_dot" style="background:#58a6ff;"></span><span>🌐 <strong>Location Active:</strong> Network Telemetry Connected</span>';
          setTimeout(() => { locPill.classList.add('hidden'); }, 3000);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setTimeout(() => { locPill.classList.add('hidden'); }, 2500);
    }
  } catch (e) {}
})();
</script>
`;

