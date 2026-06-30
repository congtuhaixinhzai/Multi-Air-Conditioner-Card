/**
 * Smart Switch Panel Card
 * v1.1 — with Professional Visual Editor
 * Designed to match Multi-Air-Conditioner Card aesthetic
 * Premium dark glassmorphic toggle panel for Home Assistant
 */

// ─── Color presets ──────────────────────────────────────────────────────────────
const SSP_COLOR_OPTIONS = [
  { id: 'deep-orange', label: 'Cam đậm', hex: '#ff5722' },
  { id: 'red', label: 'Đỏ', hex: '#ef4444' },
  { id: 'cyan', label: 'Xanh dương', hex: '#06b6d4' },
  { id: 'amber', label: 'Vàng hổ phách', hex: '#f59e0b' },
  { id: 'blue', label: 'Xanh lam', hex: '#3b82f6' },
  { id: 'green', label: 'Xanh lá', hex: '#22c55e' },
  { id: 'purple', label: 'Tím', hex: '#a855f7' },
  { id: 'pink', label: 'Hồng', hex: '#ec4899' },
  { id: 'teal', label: 'Xanh ngọc', hex: '#14b8a6' },
  { id: 'indigo', label: 'Chàm', hex: '#6366f1' },
  { id: 'grey', label: 'Xám', hex: '#6b7280' },
];

const SSP_BG_PRESETS = [
  { id: 'default', label: 'Default', c1: '#001e2b', c2: '#12c6f3' },
  { id: 'night', label: 'Night', c1: '#0d0d1a', c2: '#1a0a3a' },
  { id: 'sunset', label: 'Sunset', c1: '#1a0a00', c2: '#ff6b35' },
  { id: 'forest', label: 'Forest', c1: '#0a1a0a', c2: '#1a5c1a' },
  { id: 'aurora', label: 'Aurora', c1: '#0a0a1a', c2: '#00cc88' },
  { id: 'ocean', label: 'Ocean', c1: '#001020', c2: '#0055aa' },
  { id: 'cherry', label: 'Cherry', c1: '#1a0010', c2: '#cc2255' },
  { id: 'galaxy', label: 'Galaxy', c1: '#080818', c2: '#6633cc' },
  { id: 'deep_neon', label: '🔵 Deep Neon', c1: '#020b18', c2: '#00d4ff' },
  { id: 'custom', label: '✏ Custom', c1: null, c2: null },
];

const SSP_SECTION_ICONS = [
  'mdi:water-boiler', 'mdi:solar-panel', 'mdi:cog', 'mdi:lightbulb-group',
  'mdi:fan', 'mdi:power-plug', 'mdi:home-lightning-bolt', 'mdi:security',
  'mdi:pump', 'mdi:ev-station', 'mdi:garage', 'mdi:gate',
];

// ─── Main Card ──────────────────────────────────────────────────────────────────
class SmartSwitchPanelCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
  }

  static getConfigElement() {
    return document.createElement('smart-switch-panel-card-editor');
  }

  static getStubConfig() {
    return {
      title: 'Bảng Điều Khiển',
      background_preset: 'default',
      bg_alpha: 80,
      columns: 2,
      sections: [
        {
          title: '🌡️ Thiết bị Chính & Bơm',
          cards: [
            { entity: '', name: 'Thiết bị 1', icon: 'mdi:power-plug', color: 'cyan' },
            { entity: '', name: 'Thiết bị 2', icon: 'mdi:power-plug', color: 'cyan' },
          ]
        }
      ]
    };
  }

  setConfig(config) {
    if (!config.sections || !Array.isArray(config.sections)) {
      throw new Error('Cần cấu hình sections[]');
    }
    this._config = Object.assign({
      title: 'Bảng Điều Khiển',
      background_preset: 'default',
      bg_color1: '#001e2b',
      bg_color2: '#12c6f3',
      bg_alpha: 80,
      columns: 2,
    }, config);
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _getState(entityId) {
    if (!this._hass || !this._hass.states || !this._hass.states[entityId]) return 'unavailable';
    return this._hass.states[entityId].state;
  }

  _toggle(entityId) {
    if (!this._hass) return;
    const stateObj = this._hass.states[entityId];
    if (!stateObj) return;
    const domain = entityId.split('.')[0];
    if (domain === 'switch' || domain === 'input_boolean' || domain === 'light' || domain === 'fan') {
      this._hass.callService(domain, 'toggle', { entity_id: entityId });
    } else {
      this._hass.callService('homeassistant', 'toggle', { entity_id: entityId });
    }
  }

  _getBgGradient() {
    const cfg = this._config;
    const p = SSP_BG_PRESETS.find(x => x.id === cfg.background_preset) || SSP_BG_PRESETS[0];
    const c1 = cfg.background_preset === 'custom' ? (cfg.bg_color1 || '#001e2b') : (p.c1 || '#001e2b');
    const c2 = cfg.background_preset === 'custom' ? (cfg.bg_color2 || '#12c6f3') : (p.c2 || '#12c6f3');
    const a = Math.max(0, Math.min(100, parseInt(cfg.bg_alpha) || 80));
    const ah = Math.round(a * 2.55).toString(16).padStart(2, '0');
    const ah2 = Math.round(a * 2.55 / 3).toString(16).padStart(2, '0');
    return `linear-gradient(135deg, ${c1}${ah} 0%, ${c2}${ah2} 100%)`;
  }

  _colorMap(color) {
    const found = SSP_COLOR_OPTIONS.find(c => c.id === color);
    if (found) return found.hex;
    if (color && color.startsWith('#')) return color;
    if (color && color.startsWith('rgb')) return color;
    return '#06b6d4';
  }

  _hexToRgba(hex, alpha) {
    hex = (hex || '#06b6d4').replace('#', '');
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  _render() {
    if (!this._config || !this._hass) return;
    const cfg = this._config;
    const bg = this._getBgGradient();
    const cols = cfg.columns || 2;

    const h = new Date().getHours();
    let greet = 'Chúc ngủ ngon,';
    if (h >= 6 && h < 11) greet = 'Chào buổi sáng,';
    else if (h >= 11 && h < 13) greet = 'Chào buổi trưa,';
    else if (h >= 13 && h < 18) greet = 'Chào buổi chiều,';
    else if (h >= 18 && h < 21) greet = 'Chào buổi tối,';

    let totalOn = 0, totalOff = 0;
    cfg.sections.forEach(s => {
      (s.cards || []).forEach(c => {
        if (!c.entity) return;
        const st = this._getState(c.entity);
        if (st === 'on') totalOn++; else totalOff++;
      });
    });

    let sectionsHtml = '';
    cfg.sections.forEach((section, si) => {
      let cardsHtml = '';
      (section.cards || []).forEach((card, ci) => {
        if (!card.entity) return;
        const st = this._getState(card.entity);
        const isOn = st === 'on';
        const isUnavail = st === 'unavailable' || st === 'unknown';
        const color = this._colorMap(card.color);

        const btnClass = 'sw-btn' + (isOn ? ' sw-btn--on' : '') + (isUnavail ? ' sw-btn--unavail' : '');
        const glowStyle = isOn
          ? `box-shadow:0 0 20px ${this._hexToRgba(color, 0.35)},0 0 40px ${this._hexToRgba(color, 0.15)},inset 0 1px 0 rgba(255,255,255,0.15);border-color:${this._hexToRgba(color, 0.6)};`
          : '';
        const iconColor = isOn ? color : (isUnavail ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)');
        const iconGlow = isOn ? `filter:drop-shadow(0 0 8px ${this._hexToRgba(color, 0.7)});` : '';
        const ledStyle = isOn ? `background:${color};box-shadow:0 0 8px ${color},0 0 16px ${this._hexToRgba(color, 0.4)};` : '';
        const ledClass = isOn ? 'sw-led sw-led--on' : (isUnavail ? 'sw-led sw-led--unavail' : 'sw-led sw-led--off');

        cardsHtml += `
          <button class="${btnClass}" data-entity="${card.entity}" style="${glowStyle}">
            <div class="sw-ico-wrap">
              <ha-icon icon="${card.icon || 'mdi:toggle-switch'}" style="--mdc-icon-size:28px;color:${iconColor};${iconGlow}"></ha-icon>
            </div>
            <div class="sw-info">
              <span class="sw-name">${card.name || card.entity}</span>
              <span class="sw-state" style="color:${isOn ? color : (isUnavail ? '#f87171' : 'rgba(255,255,255,0.4)')}">${isOn ? 'BẬT' : (isUnavail ? 'OFFLINE' : 'TẮT')}</span>
            </div>
            <span class="${ledClass}" style="${ledStyle}"></span>
          </button>`;
      });

      sectionsHtml += `
        <div class="sw-section">
          <div class="sw-sec-header">
            <span class="sw-sec-line"></span>
            <span class="sw-sec-title">${section.title || 'Nhóm ' + (si + 1)}</span>
            <span class="sw-sec-line"></span>
          </div>
          <div class="sw-grid" style="grid-template-columns:repeat(${cols},1fr);">
            ${cardsHtml}
          </div>
        </div>`;
    });

    const summaryHtml = `
      <div class="sw-summary">
        <div class="sw-pill sw-pill--on">
          <ha-icon icon="mdi:power-plug" style="--mdc-icon-size:14px;color:#34d399;"></ha-icon>
          <span class="sw-pill-val" style="color:#34d399;">${totalOn}</span>
          <span class="sw-pill-lbl">Đang bật</span>
        </div>
        <div class="sw-pill sw-pill--off">
          <ha-icon icon="mdi:power-plug-off" style="--mdc-icon-size:14px;color:rgba(255,255,255,0.5);"></ha-icon>
          <span class="sw-pill-val">${totalOff}</span>
          <span class="sw-pill-lbl">Đang tắt</span>
        </div>
      </div>`;

    const html = `
      <div class="ssp-card" style="background:${bg};">
        <div class="ssp-header">
          <div class="ssp-hdr-left">
            <div class="ssp-hdr-icon">
              <ha-icon icon="${cfg.header_icon || 'mdi:home-automation'}" style="--mdc-icon-size:26px;color:#00e5ff;filter:drop-shadow(0 0 10px rgba(0,229,255,0.5));"></ha-icon>
            </div>
            <div class="ssp-hdr-text">
              <div class="ssp-greet">${greet}</div>
              <div class="ssp-title">${cfg.title || 'Bảng Điều Khiển'}</div>
            </div>
          </div>
          <div class="ssp-hdr-right">
            ${summaryHtml}
          </div>
        </div>
        ${sectionsHtml}
      </div>`;

    if (!this.shadowRoot.getElementById('ssp-style')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700&display=swap';
      this.shadowRoot.appendChild(link);

      const style = document.createElement('style');
      style.id = 'ssp-style';
      style.textContent = `
*{box-sizing:border-box;margin:0;padding:0}
:host{display:block;font-family:'Sora',sans-serif;--accent:#00e5ff}
.ssp-card{border-radius:22px;padding:18px 16px 14px;color:#fff;position:relative;overflow:hidden}
.ssp-card::before{content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse at 20% 0%,rgba(0,229,255,0.06) 0%,transparent 60%),
             radial-gradient(ellipse at 80% 100%,rgba(52,211,153,0.04) 0%,transparent 50%);
  pointer-events:none;z-index:0}
.ssp-card>*{position:relative;z-index:1}
.ssp-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:10px}
.ssp-hdr-left{display:flex;align-items:center;gap:10px}
.ssp-hdr-icon{width:44px;height:44px;border-radius:14px;
  background:linear-gradient(145deg,rgba(0,229,255,0.15),rgba(0,180,220,0.08));
  border:1px solid rgba(0,229,255,0.25);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  box-shadow:0 0 20px rgba(0,229,255,0.15),inset 0 1px 0 rgba(255,255,255,0.1)}
.ssp-greet{font-size:10px;color:rgba(255,255,255,0.5);font-weight:500;letter-spacing:0.5px}
.ssp-title{font-size:16px;font-weight:700;color:rgba(255,255,255,0.95);letter-spacing:0.5px;margin-top:1px}
.ssp-hdr-right{display:flex;flex-direction:column;gap:4px;align-items:flex-end}
.sw-summary{display:flex;gap:6px}
.sw-pill{display:flex;align-items:center;gap:4px;
  background:rgba(0,20,50,0.4);border:1px solid rgba(255,255,255,0.12);
  border-radius:20px;padding:4px 10px 4px 6px}
.sw-pill--on{border-color:rgba(52,211,153,0.3)}
.sw-pill-val{font-family:'Orbitron',sans-serif;font-size:12px;font-weight:700}
.sw-pill-lbl{font-size:8px;color:rgba(255,255,255,0.45);font-weight:600;letter-spacing:0.3px}
.sw-section{margin-bottom:10px}
.sw-section:last-child{margin-bottom:0}
.sw-sec-header{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:0 2px}
.sw-sec-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)}
.sw-sec-title{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
  color:rgba(255,255,255,0.55);white-space:nowrap;flex-shrink:0}
.sw-grid{display:grid;gap:8px}
.sw-btn{display:flex;align-items:center;gap:10px;
  background:rgba(0,20,50,0.3);border:1px solid rgba(255,255,255,0.12);
  border-radius:14px;padding:12px 12px;cursor:pointer;outline:none;
  font-family:'Sora',sans-serif;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);
  position:relative;overflow:hidden;-webkit-tap-highlight-color:transparent;
  touch-action:manipulation;user-select:none}
.sw-btn::before{content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(255,255,255,0.04) 0%,transparent 50%);
  pointer-events:none;transition:opacity 0.3s;opacity:1}
.sw-btn:hover{background:rgba(0,30,70,0.45);transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,0.3)}
.sw-btn:hover::before{opacity:0}
.sw-btn:active{transform:translateY(1px) scale(0.98);transition-duration:0.08s}
.sw-btn--on{background:linear-gradient(145deg,rgba(0,30,60,0.5),rgba(0,20,45,0.6))}
.sw-btn--on::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)}
.sw-btn--unavail{opacity:0.45;cursor:not-allowed}
.sw-btn--unavail:hover{transform:none;box-shadow:none}
.sw-ico-wrap{width:40px;height:40px;border-radius:12px;
  background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.25s}
.sw-btn--on .sw-ico-wrap{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.12)}
.sw-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.sw-name{font-size:11px;font-weight:600;color:rgba(255,255,255,0.88);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sw-state{font-size:8px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase}
.sw-led{width:8px;height:8px;border-radius:50%;flex-shrink:0;transition:all 0.3s}
.sw-led--on{animation:ledPulse 2.5s ease-in-out infinite}
.sw-led--off{background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.1)}
.sw-led--unavail{background:rgba(248,113,113,0.4);border:1px solid rgba(248,113,113,0.3)}
@keyframes ledPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.85)}}
@keyframes ripple{0%{transform:scale(0);opacity:0.4}100%{transform:scale(2.5);opacity:0}}
.sw-ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,0.2);pointer-events:none;animation:ripple 0.5s ease-out forwards}
      `;
      this.shadowRoot.appendChild(style);
    }

    let container = this.shadowRoot.getElementById('ssp-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ssp-root';
      this.shadowRoot.appendChild(container);
    }
    container.innerHTML = html;

    // Bind events
    const self = this;
    container.querySelectorAll('.sw-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const eid = this.dataset.entity;
        if (!eid) return;
        const st = self._getState(eid);
        if (st === 'unavailable' || st === 'unknown') return;
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        ripple.className = 'sw-ripple';
        ripple.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px;`;
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
        self._toggle(eid);
      });

      let longTimer = null;
      btn.addEventListener('pointerdown', function () {
        const b = this;
        longTimer = setTimeout(() => {
          const eid = b.dataset.entity;
          if (eid) {
            const ev = new Event('hass-more-info', { bubbles: true, composed: true });
            ev.detail = { entityId: eid };
            b.dispatchEvent(ev);
          }
        }, 500);
      });
      btn.addEventListener('pointerup', () => clearTimeout(longTimer));
      btn.addEventListener('pointerleave', () => clearTimeout(longTimer));
    });
  }

  getCardSize() {
    if (!this._config) return 4;
    let total = 1;
    (this._config.sections || []).forEach(s => {
      total += 1 + Math.ceil((s.cards || []).length / (this._config.columns || 2));
    });
    return total;
  }
}

customElements.define('smart-switch-panel-card', SmartSwitchPanelCard);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── VISUAL EDITOR ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
class SmartSwitchPanelCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._openSections = {};  // track accordion state
  }

  set hass(hass) {
    this._hass = hass;
    // Re-bind entity pickers
    this.shadowRoot.querySelectorAll('ha-entity-picker').forEach(p => {
      p.hass = hass;
    });
  }

  setConfig(config) {
    this._config = JSON.parse(JSON.stringify(config || {}));
    if (!this._config.sections) this._config.sections = [];
    this._render();
  }

  _fire(cfg) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: cfg },
      bubbles: true, composed: true,
    }));
  }

  _render() {
    const cfg = this._config;
    const bgPreset = cfg.background_preset || 'default';

    // ── Background preset grid ──
    let bgGrid = '';
    SSP_BG_PRESETS.forEach(p => {
      const sel = bgPreset === p.id;
      const grad = p.c1 && p.c2
        ? `linear-gradient(135deg,${p.c1},${p.c2})`
        : 'linear-gradient(135deg,#333,#666)';
      bgGrid += `<button class="bg-pre ${sel ? 'bg-pre--sel' : ''}" data-bg="${p.id}"
        style="background:${grad};" title="${p.label}">
        <span class="bg-pre-lbl">${p.label}</span>
      </button>`;
    });

    // ── Sections editor ──
    let sectionsHtml = '';
    (cfg.sections || []).forEach((section, si) => {
      const isOpen = this._openSections[si] !== false; // default open
      let cardsHtml = '';
      (section.cards || []).forEach((card, ci) => {
        // Color selector
        let colorOpts = '';
        SSP_COLOR_OPTIONS.forEach(co => {
          const sel = card.color === co.id;
          colorOpts += `<button class="color-dot ${sel ? 'color-dot--sel' : ''}"
            data-sec="${si}" data-card="${ci}" data-color="${co.id}"
            style="background:${co.hex};" title="${co.label}"></button>`;
        });

        cardsHtml += `
          <div class="ed-card-block">
            <div class="ed-card-hdr">
              <span class="ed-card-num">⚡ Thiết bị ${ci + 1}</span>
              <button class="ed-card-del" data-sec="${si}" data-card="${ci}" title="Xóa">✕</button>
            </div>
            <div class="ed-row">
              <label>🔌 Entity (switch.*, light.*, fan.*)</label>
              <ha-entity-picker data-sec="${si}" data-card="${ci}" data-field="entity"
                allow-custom-entity></ha-entity-picker>
            </div>
            <div class="ed-row">
              <label>🏷 Tên hiển thị</label>
              <input class="ed-inp" type="text" data-sec="${si}" data-card="${ci}" data-field="name"
                placeholder="Tên thiết bị" value="${card.name || ''}"/>
            </div>
            <div class="ed-row">
              <label>🎨 Icon (mdi:*)</label>
              <input class="ed-inp" type="text" data-sec="${si}" data-card="${ci}" data-field="icon"
                placeholder="mdi:power-plug" value="${card.icon || ''}"/>
            </div>
            <div class="ed-row">
              <label>🎨 Màu sắc</label>
              <div class="color-grid">${colorOpts}</div>
            </div>
          </div>`;
      });

      sectionsHtml += `
        <div class="ed-section">
          <button class="ed-sec-toggle" data-sec-toggle="${si}">
            <span class="ed-sec-arrow ${isOpen ? 'ed-sec-arrow--open' : ''}">▶</span>
            <span class="ed-sec-title-text">📦 Nhóm ${si + 1}: ${section.title || 'Chưa đặt tên'}</span>
            <button class="ed-sec-del" data-sec-del="${si}" title="Xóa nhóm">🗑</button>
          </button>
          <div class="ed-sec-body ${isOpen ? '' : 'ed-sec-body--closed'}">
            <div class="ed-row">
              <label>📝 Tiêu đề nhóm</label>
              <input class="ed-inp" type="text" data-sec="${si}" data-field="title"
                placeholder="VD: 🌡️ Thiết bị chính" value="${section.title || ''}"/>
            </div>
            <div class="ed-cards-wrap">
              ${cardsHtml}
            </div>
            <button class="ed-add-card" data-sec="${si}">+ Thêm thiết bị</button>
          </div>
        </div>`;
    });

    this.shadowRoot.innerHTML = `
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        :host{display:block;font-family:var(--paper-font-body1_-_font-family,Roboto,sans-serif);
          color:var(--primary-text-color)}
        .ed-wrap{padding:12px 0}
        h3{font-size:14px;font-weight:700;margin:0 0 12px;display:flex;align-items:center;gap:6px}

        /* ── Accordion ── */
        .ed-acc{margin-bottom:8px;border:1px solid var(--divider-color);border-radius:10px;overflow:hidden}
        .ed-acc-hdr{display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer;
          background:var(--card-background-color);user-select:none;font-size:13px;font-weight:600}
        .ed-acc-hdr:hover{background:var(--secondary-background-color)}
        .ed-acc-arrow{font-size:10px;transition:transform 0.2s;color:var(--secondary-text-color)}
        .ed-acc-arrow--open{transform:rotate(90deg)}
        .ed-acc-body{padding:10px 12px;display:flex;flex-direction:column;gap:8px;
          background:var(--card-background-color)}
        .ed-acc-body--closed{display:none}

        /* ── Row ── */
        .ed-row{display:flex;flex-direction:column;gap:4px;margin-bottom:6px}
        .ed-row label{font-size:11px;font-weight:600;color:var(--secondary-text-color)}
        .ed-inp{background:var(--input-fill-color,rgba(0,0,0,0.05));border:1px solid var(--divider-color);
          border-radius:8px;padding:8px 10px;font-size:13px;color:var(--primary-text-color);
          outline:none;font-family:inherit;width:100%}
        .ed-inp:focus{border-color:var(--primary-color);box-shadow:0 0 0 1px var(--primary-color)}
        ha-entity-picker{width:100%}

        /* ── BG Preset Grid ── */
        .bg-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:6px}
        .bg-pre{width:100%;aspect-ratio:1.6;border-radius:8px;border:2px solid transparent;
          cursor:pointer;position:relative;overflow:hidden;outline:none;transition:all 0.15s}
        .bg-pre:hover{transform:scale(1.05);box-shadow:0 2px 8px rgba(0,0,0,0.3)}
        .bg-pre--sel{border-color:var(--primary-color);box-shadow:0 0 0 1px var(--primary-color),0 2px 8px rgba(0,0,0,0.3)}
        .bg-pre-lbl{position:absolute;bottom:2px;left:0;right:0;text-align:center;
          font-size:7px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.8);letter-spacing:0.3px}

        /* ── Color dots ── */
        .color-grid{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
        .color-dot{width:24px;height:24px;border-radius:50%;border:2px solid transparent;
          cursor:pointer;outline:none;transition:all 0.15s}
        .color-dot:hover{transform:scale(1.2)}
        .color-dot--sel{border-color:#fff;box-shadow:0 0 0 2px var(--primary-color),0 0 8px rgba(0,0,0,0.3)}

        /* ── Section editor ── */
        .ed-section{border:1px solid var(--divider-color);border-radius:10px;margin-bottom:8px;overflow:hidden}
        .ed-sec-toggle{display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer;
          background:var(--card-background-color);user-select:none;font-size:12px;font-weight:600;
          border:none;width:100%;text-align:left;color:var(--primary-text-color);font-family:inherit}
        .ed-sec-toggle:hover{background:var(--secondary-background-color)}
        .ed-sec-arrow{font-size:9px;transition:transform 0.2s;color:var(--secondary-text-color)}
        .ed-sec-arrow--open{transform:rotate(90deg)}
        .ed-sec-title-text{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .ed-sec-del{background:none;border:none;cursor:pointer;font-size:14px;padding:2px 6px;
          border-radius:6px;transition:background 0.15s;color:var(--secondary-text-color)}
        .ed-sec-del:hover{background:rgba(239,68,68,0.15);color:#ef4444}
        .ed-sec-body{padding:10px 12px;display:flex;flex-direction:column;gap:6px;
          background:var(--card-background-color)}
        .ed-sec-body--closed{display:none}

        /* ── Card block ── */
        .ed-card-block{border:1px solid var(--divider-color);border-radius:8px;padding:10px;
          margin-bottom:6px;background:var(--secondary-background-color)}
        .ed-card-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
        .ed-card-num{font-size:11px;font-weight:700;color:var(--primary-color)}
        .ed-card-del{background:none;border:none;cursor:pointer;font-size:12px;padding:2px 6px;
          border-radius:6px;color:var(--secondary-text-color);transition:all 0.15s}
        .ed-card-del:hover{background:rgba(239,68,68,0.15);color:#ef4444}

        /* ── Buttons ── */
        .ed-add-card{background:rgba(var(--rgb-primary-color,3,169,244),0.08);border:1px dashed var(--primary-color);
          border-radius:8px;padding:8px;font-size:12px;font-weight:600;color:var(--primary-color);
          cursor:pointer;outline:none;width:100%;text-align:center;transition:all 0.15s;font-family:inherit}
        .ed-add-card:hover{background:rgba(var(--rgb-primary-color,3,169,244),0.15)}
        .ed-add-sec{background:var(--primary-color);border:none;border-radius:10px;padding:10px;
          font-size:13px;font-weight:700;color:#fff;cursor:pointer;outline:none;width:100%;
          text-align:center;transition:all 0.15s;font-family:inherit;margin-top:4px}
        .ed-add-sec:hover{filter:brightness(1.1);transform:translateY(-1px)}

        /* ── Slider ── */
        .ed-slider-row{display:flex;align-items:center;gap:10px}
        .ed-slider{flex:1;-webkit-appearance:none;height:6px;border-radius:3px;
          background:var(--divider-color);outline:none}
        .ed-slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;
          border-radius:50%;background:var(--primary-color);cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,0.3)}
        .ed-slider-val{font-size:12px;font-weight:700;min-width:32px;text-align:right;
          color:var(--primary-text-color)}
        .ed-select{background:var(--input-fill-color,rgba(0,0,0,0.05));border:1px solid var(--divider-color);
          border-radius:8px;padding:8px 10px;font-size:13px;color:var(--primary-text-color);
          outline:none;font-family:inherit;width:100%;cursor:pointer}
      </style>

      <div class="ed-wrap">
        <!-- ═══ General Settings ═══ -->
        <div class="ed-acc">
          <div class="ed-acc-hdr" id="acc-general-hdr">
            <span class="ed-acc-arrow ed-acc-arrow--open" id="acc-general-arrow">▶</span>
            ⚙️ Cài đặt chung
          </div>
          <div class="ed-acc-body" id="acc-general-body">
            <div class="ed-row">
              <label>📝 Tiêu đề card</label>
              <input class="ed-inp" type="text" id="inp-title" placeholder="Bảng Điều Khiển"
                value="${cfg.title || ''}"/>
            </div>
            <div class="ed-row">
              <label>🎨 Icon header (mdi:*)</label>
              <input class="ed-inp" type="text" id="inp-header-icon" placeholder="mdi:home-automation"
                value="${cfg.header_icon || ''}"/>
            </div>
            <div class="ed-row">
              <label>📊 Số cột (1–4)</label>
              <div class="ed-slider-row">
                <input class="ed-slider" type="range" id="inp-columns" min="1" max="4" step="1"
                  value="${cfg.columns || 2}"/>
                <span class="ed-slider-val" id="val-columns">${cfg.columns || 2}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ Background ═══ -->
        <div class="ed-acc">
          <div class="ed-acc-hdr" id="acc-bg-hdr">
            <span class="ed-acc-arrow" id="acc-bg-arrow">▶</span>
            🎨 Màu nền
          </div>
          <div class="ed-acc-body ed-acc-body--closed" id="acc-bg-body">
            <div class="ed-row">
              <label>Preset</label>
              <div class="bg-grid">${bgGrid}</div>
            </div>
            ${bgPreset === 'custom' ? `
            <div class="ed-row">
              <label>🎨 Màu 1 (trên trái)</label>
              <input class="ed-inp" type="color" id="inp-bg-c1" value="${cfg.bg_color1 || '#001e2b'}"/>
            </div>
            <div class="ed-row">
              <label>🎨 Màu 2 (dưới phải)</label>
              <input class="ed-inp" type="color" id="inp-bg-c2" value="${cfg.bg_color2 || '#12c6f3'}"/>
            </div>
            ` : ''}
            <div class="ed-row">
              <label>🔆 Độ trong suốt nền</label>
              <div class="ed-slider-row">
                <input class="ed-slider" type="range" id="inp-bg-alpha" min="0" max="100" step="5"
                  value="${cfg.bg_alpha != null ? cfg.bg_alpha : 80}"/>
                <span class="ed-slider-val" id="val-bg-alpha">${cfg.bg_alpha != null ? cfg.bg_alpha : 80}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ Sections (devices) ═══ -->
        <div class="ed-acc">
          <div class="ed-acc-hdr" id="acc-sec-hdr">
            <span class="ed-acc-arrow ed-acc-arrow--open" id="acc-sec-arrow">▶</span>
            🔌 Nhóm thiết bị (${(cfg.sections || []).length} nhóm)
          </div>
          <div class="ed-acc-body" id="acc-sec-body">
            ${sectionsHtml}
            <button class="ed-add-sec" id="btn-add-section">+ Thêm nhóm thiết bị</button>
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const self = this;
    const r = this.shadowRoot;
    const cfg = this._config;

    // ── Accordion toggles ──
    ['general', 'bg', 'sec'].forEach(id => {
      const hdr = r.getElementById('acc-' + id + '-hdr');
      const body = r.getElementById('acc-' + id + '-body');
      const arrow = r.getElementById('acc-' + id + '-arrow');
      if (hdr && body && arrow) {
        hdr.addEventListener('click', () => {
          body.classList.toggle('ed-acc-body--closed');
          arrow.classList.toggle('ed-acc-arrow--open');
        });
      }
    });

    // ── Section toggles ──
    r.querySelectorAll('[data-sec-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.closest('[data-sec-del]')) return;
        const si = parseInt(btn.dataset.secToggle);
        self._openSections[si] = self._openSections[si] === false ? true : (self._openSections[si] === true ? false : false);
        self._render();
      });
    });

    // ── General inputs ──
    const inpTitle = r.getElementById('inp-title');
    if (inpTitle) {
      inpTitle.addEventListener('input', (e) => {
        cfg.title = e.target.value;
        self._fire(cfg);
      });
      // Prevent HA from stealing focus
      inpTitle.addEventListener('focus', e => e.stopPropagation());
    }

    const inpHeaderIcon = r.getElementById('inp-header-icon');
    if (inpHeaderIcon) {
      inpHeaderIcon.addEventListener('input', (e) => {
        cfg.header_icon = e.target.value;
        self._fire(cfg);
      });
      inpHeaderIcon.addEventListener('focus', e => e.stopPropagation());
    }

    const inpCols = r.getElementById('inp-columns');
    const valCols = r.getElementById('val-columns');
    if (inpCols) {
      inpCols.addEventListener('input', (e) => {
        cfg.columns = parseInt(e.target.value);
        if (valCols) valCols.textContent = cfg.columns;
        self._fire(cfg);
      });
    }

    // ── Background ──
    r.querySelectorAll('[data-bg]').forEach(btn => {
      btn.addEventListener('click', () => {
        cfg.background_preset = btn.dataset.bg;
        const p = SSP_BG_PRESETS.find(x => x.id === cfg.background_preset);
        if (p && p.c1) { cfg.bg_color1 = p.c1; cfg.bg_color2 = p.c2; }
        self._fire(cfg);
        self._render();
      });
    });

    const inpBgC1 = r.getElementById('inp-bg-c1');
    if (inpBgC1) {
      inpBgC1.addEventListener('input', (e) => { cfg.bg_color1 = e.target.value; self._fire(cfg); });
    }
    const inpBgC2 = r.getElementById('inp-bg-c2');
    if (inpBgC2) {
      inpBgC2.addEventListener('input', (e) => { cfg.bg_color2 = e.target.value; self._fire(cfg); });
    }
    const inpBgAlpha = r.getElementById('inp-bg-alpha');
    const valBgAlpha = r.getElementById('val-bg-alpha');
    if (inpBgAlpha) {
      inpBgAlpha.addEventListener('input', (e) => {
        cfg.bg_alpha = parseInt(e.target.value);
        if (valBgAlpha) valBgAlpha.textContent = cfg.bg_alpha + '%';
        self._fire(cfg);
      });
    }

    // ── Section title inputs ──
    r.querySelectorAll('.ed-inp[data-sec][data-field="title"]:not([data-card])').forEach(inp => {
      const si = parseInt(inp.dataset.sec);
      inp.addEventListener('input', (e) => {
        if (cfg.sections[si]) {
          cfg.sections[si].title = e.target.value;
          self._fire(cfg);
        }
      });
      inp.addEventListener('focus', e => e.stopPropagation());
    });

    // ── Card inputs (name, icon) ──
    r.querySelectorAll('.ed-inp[data-sec][data-card]').forEach(inp => {
      const si = parseInt(inp.dataset.sec);
      const ci = parseInt(inp.dataset.card);
      const field = inp.dataset.field;
      inp.addEventListener('input', (e) => {
        if (cfg.sections[si] && cfg.sections[si].cards && cfg.sections[si].cards[ci]) {
          cfg.sections[si].cards[ci][field] = e.target.value;
          self._fire(cfg);
        }
      });
      inp.addEventListener('focus', e => e.stopPropagation());
    });

    // ── Entity pickers ──
    r.querySelectorAll('ha-entity-picker[data-sec][data-card]').forEach(p => {
      const si = parseInt(p.dataset.sec);
      const ci = parseInt(p.dataset.card);
      if (self._hass) p.hass = self._hass;
      if (cfg.sections[si] && cfg.sections[si].cards && cfg.sections[si].cards[ci]) {
        p.value = cfg.sections[si].cards[ci].entity || '';
      }
      p.addEventListener('value-changed', (e) => {
        if (cfg.sections[si] && cfg.sections[si].cards && cfg.sections[si].cards[ci]) {
          cfg.sections[si].cards[ci].entity = e.detail.value || '';
          self._fire(cfg);
        }
      });
    });

    // ── Color dots ──
    r.querySelectorAll('.color-dot[data-sec][data-card][data-color]').forEach(dot => {
      dot.addEventListener('click', () => {
        const si = parseInt(dot.dataset.sec);
        const ci = parseInt(dot.dataset.card);
        if (cfg.sections[si] && cfg.sections[si].cards && cfg.sections[si].cards[ci]) {
          cfg.sections[si].cards[ci].color = dot.dataset.color;
          self._fire(cfg);
          self._render();
        }
      });
    });

    // ── Delete card ──
    r.querySelectorAll('.ed-card-del[data-sec][data-card]').forEach(btn => {
      btn.addEventListener('click', () => {
        const si = parseInt(btn.dataset.sec);
        const ci = parseInt(btn.dataset.card);
        if (cfg.sections[si] && cfg.sections[si].cards) {
          cfg.sections[si].cards.splice(ci, 1);
          self._fire(cfg);
          self._render();
        }
      });
    });

    // ── Add card ──
    r.querySelectorAll('.ed-add-card[data-sec]').forEach(btn => {
      btn.addEventListener('click', () => {
        const si = parseInt(btn.dataset.sec);
        if (cfg.sections[si]) {
          if (!cfg.sections[si].cards) cfg.sections[si].cards = [];
          cfg.sections[si].cards.push({
            entity: '', name: '', icon: 'mdi:power-plug', color: 'cyan'
          });
          self._fire(cfg);
          self._render();
        }
      });
    });

    // ── Delete section ──
    r.querySelectorAll('[data-sec-del]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const si = parseInt(btn.dataset.secDel);
        cfg.sections.splice(si, 1);
        self._fire(cfg);
        self._render();
      });
    });

    // ── Add section ──
    const btnAddSec = r.getElementById('btn-add-section');
    if (btnAddSec) {
      btnAddSec.addEventListener('click', () => {
        cfg.sections.push({
          title: '📦 Nhóm mới',
          cards: [
            { entity: '', name: '', icon: 'mdi:power-plug', color: 'cyan' },
            { entity: '', name: '', icon: 'mdi:power-plug', color: 'cyan' },
          ]
        });
        self._openSections[cfg.sections.length - 1] = true;
        self._fire(cfg);
        self._render();
      });
    }
  }
}

customElements.define('smart-switch-panel-card-editor', SmartSwitchPanelCardEditor);

// ─── Registration ───────────────────────────────────────────────────────────────
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'smart-switch-panel-card',
  name: 'Smart Switch Panel Card',
  preview: true,
  description: 'Premium dark glassmorphic switch panel with Visual Editor — designed by congtuhaixinhzai 🇻🇳',
});

console.info(
  '%c SMART-SWITCH-PANEL %c v1.1 Editor ✓ ',
  'background:#00e5ff;color:#000;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;',
  'background:#1a1a2e;color:#00e5ff;font-weight:500;padding:2px 6px;border-radius:0 4px 4px 0;'
);
