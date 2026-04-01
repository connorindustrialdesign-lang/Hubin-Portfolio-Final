(function() {
  var PASSWORD_HASH = '6ee0821eeb27585f2eafc04425c346bca6c96bfd216d87d0d7e0e368d71af587';
  var STORAGE_KEY = 'ch_portfolio_access';

  function sha256(str) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function(buf) {
      return Array.from(new Uint8Array(buf)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }

  function isUnlocked() {
    return sessionStorage.getItem(STORAGE_KEY) === '1';
  }

  function unlock() {
    sessionStorage.setItem(STORAGE_KEY, '1');
  }

  function gateHTML() {
    return '<div id="pw-gate" style="position:fixed;inset:0;z-index:9999;background:#fafaf8;display:flex;align-items:center;justify-content:center;font-family:Space Grotesk,sans-serif;">' +
      '<div style="text-align:center;max-width:380px;padding:40px;">' +
        '<svg style="width:44px;height:44px;margin-bottom:18px;color:#bbb;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
          '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>' +
          '<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>' +
        '</svg>' +
        '<h2 style="font-size:22px;font-weight:600;margin:0 0 10px;color:#222;">Protected Content</h2>' +
        '<p style="font-size:14px;color:#888;line-height:1.6;margin:0 0 24px;">' +
          'To request access, please email<br>' +
          '<a href="mailto:connor.industrialdesign@gmail.com" style="color:#0b6b97;text-decoration:none;">connor.industrialdesign@gmail.com</a>' +
        '</p>' +
        '<div style="display:flex;gap:8px;">' +
          '<input type="password" id="pw-gate-input" placeholder="Enter password" ' +
            'style="flex:1;padding:11px 14px;border:1px solid #ddd;border-radius:8px;font-size:14px;font-family:inherit;outline:none;background:#fff;">' +
          '<button id="pw-gate-submit" ' +
            'style="padding:11px 20px;background:#222;color:#fff;border:none;border-radius:8px;font-size:14px;font-family:inherit;cursor:pointer;">Submit</button>' +
        '</div>' +
        '<p id="pw-gate-error" style="display:none;color:#c0392b;font-size:12px;margin:10px 0 0;">Incorrect password</p>' +
      '</div>' +
    '</div>';
  }

  function attachGateHandlers(gate, onSuccess, onCancel) {
    var input = document.getElementById('pw-gate-input');
    var submit = document.getElementById('pw-gate-submit');
    var error = document.getElementById('pw-gate-error');

    function tryUnlock() {
      sha256(input.value).then(function(hash) {
        if (hash === PASSWORD_HASH) {
          unlock();
          gate.style.transition = 'opacity 0.25s';
          gate.style.opacity = '0';
          setTimeout(function() { gate.remove(); if (onSuccess) onSuccess(); }, 250);
        } else {
          error.style.display = 'block';
          input.value = '';
          input.focus();
        }
      });
    }

    submit.addEventListener('click', tryUnlock);
    input.addEventListener('keydown', function(e) { if (e.key === 'Enter') tryUnlock(); });
    setTimeout(function() { input.focus(); }, 50);

    if (onCancel) {
      document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') {
          gate.remove();
          document.removeEventListener('keydown', handler);
          onCancel();
        }
      });
    }
  }

  // Full-page gate for standalone protected pages
  window.applyPageGate = function() {
    if (isUnlocked()) return;
    document.body.insertAdjacentHTML('beforeend', gateHTML());
    var gate = document.getElementById('pw-gate');
    attachGateHandlers(gate);
  };

  // Modal gate — returns promise, resolves true if unlocked
  window.checkGate = function() {
    return new Promise(function(resolve) {
      if (isUnlocked()) { resolve(true); return; }
      document.body.insertAdjacentHTML('beforeend', gateHTML());
      var gate = document.getElementById('pw-gate');
      // Add close button for modal context
      var closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.cssText = 'position:absolute;top:14px;right:14px;width:34px;height:34px;border:none;background:rgba(0,0,0,0.06);border-radius:50%;font-size:20px;cursor:pointer;color:#888;line-height:1;';
      var inner = gate.querySelector('div');
      inner.style.position = 'relative';
      inner.appendChild(closeBtn);
      closeBtn.addEventListener('click', function() { gate.remove(); resolve(false); });
      attachGateHandlers(gate, function() { resolve(true); }, function() { resolve(false); });
    });
  };
})();
