// ==================== IKON SVG (tanpa CDN, aman offline) ====================
const ICON_PATHS = {
  'wallet':'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  'times':'<path d="M18 6 6 18M6 6l12 12"/>',
  'robot':'<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V5M9 13v1.5M15 13v1.5"/><circle cx="12" cy="4" r="1"/>',
  'image':'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  'chevron-right':'<path d="m9 18 6-6-6-6"/>','chevron-left':'<path d="m15 18-6-6 6-6"/>','chevron-down':'<path d="m6 9 6 6 6-6"/>',
  'upload':'<path d="M12 15V3M7 8l5-5 5 5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
  'download':'<path d="M12 3v12M7 10l5 5 5-5M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
  'trash':'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>',
  'plug':'<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>',
  'microphone':'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>',
  'house':'<path d="M3 11 12 3l9 8M5 10v10h5v-6h4v6h5V10"/>',
  'folder':'<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  'cog':'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  'check':'<path d="m5 12 5 5 10-11"/>',
  'chart-pie':'<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
  'calendar-days':'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  'bars':'<path d="M4 6h16M4 12h16M4 18h16"/>',
  'arrow-up':'<path d="M12 19V5M5 12l7-7 7 7"/>','arrow-down':'<path d="M12 5v14M19 12l-7 7-7-7"/>','arrow-left':'<path d="M19 12H5M12 19l-7-7 7-7"/>',
  'user':'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  'eye':'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  'eye-slash':'<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-6 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c6 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22M14.12 14.12a3 3 0 1 1-4.24-4.24"/>',
  'sun':'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  'moon':'<path d="M21 14.3A9 9 0 1 1 9.7 3a7 7 0 0 0 11.3 11.3z"/>',
  'user':'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'globe':'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  'bell':'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0"/>'
};
ICON_PATHS['trash-can'] = ICON_PATHS.trash; ICON_PATHS['file-export'] = ICON_PATHS.upload; ICON_PATHS['file-import'] = ICON_PATHS.download;
// Icons: Font Awesome CDN (applyIcons disabled to avoid double-draw with FA)
function applyIcons() { /* no-op: FA CSS renders <i class="fas fa-*"> */ }
// Clean any leftover duplicate SVGs from older builds
document.querySelectorAll('.navbtn').forEach(btn => {
  btn.querySelectorAll('svg[data-icon-done]').forEach(s => s.remove());
});

