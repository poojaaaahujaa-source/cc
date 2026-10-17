'use strict';

/**
 * Custom monochrome icon set — drawn for this project.
 * 24x24 grid, 1.5px strokes, currentColor, round joins.
 */
const ICONS = {
  layout: `<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 9h18M9 9v11"/>`,
  cart: `<path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.2L20.4 7H6"/><circle cx="9.5" cy="19.5" r="1.2"/><circle cx="17.5" cy="19.5" r="1.2"/>`,
  wp: `<circle cx="12" cy="12" r="9"/><path d="M4.2 9.4h5.3l2.6 7.1 2.1-5.2-1.1-1.9H17l-3.3 8.9"/>`,
  code: `<path d="M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5M13.5 5l-3 14"/>`,
  phone: `<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M10.6 5.5h2.8M11 18.6h2"/>`,
  brush: `<path d="M14.5 3.5 20.5 9.5 10 20H4v-6z"/><path d="M12 6l6 6"/>`,
  search: `<circle cx="10.8" cy="10.8" r="6.3"/><path d="M15.5 15.5 21 21"/>`,
  chart: `<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>`,
  share: `<circle cx="17.5" cy="5.5" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/><path d="M8.7 10.8 15.3 6.7M8.7 13.2l6.6 4.1"/>`,
  spark: `<path d="M12 2.5 14 9l6.5 2-6.5 2L12 21.5 10 13 3.5 11 10 9z"/>`,
  speed: `<path d="M4.5 18a9 9 0 1 1 15 0"/><path d="M12 13.5 16.5 8"/><circle cx="12" cy="14.5" r="1.6"/>`,
  shield: `<path d="M12 2.8 20 6v6.1c0 4.6-3.4 7.6-8 9.1-4.6-1.5-8-4.5-8-9.1V6z"/><path d="m8.5 11.8 2.4 2.4 4.6-4.9"/>`,
  layers: `<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12.5 9 5 9-5M3 17l9 5 9-5"/>`,
  globe: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9z"/>`,
  megaphone: `<path d="M4 10v4a1 1 0 0 0 1 1h3l8 4V5L8 9H5a1 1 0 0 0-1 1z"/><path d="M19 9.5a4 4 0 0 1 0 5M8 15v4.5"/>`,
  camera: `<path d="M3 8.5h4l1.6-2.2h6.8L17 8.5h4v11H3z"/><circle cx="12" cy="13.8" r="3.4"/>`,
  mail: `<rect x="2.5" y="5" width="19" height="14" rx="1.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>`,
  puzzle: `<path d="M9 3.5h6v3a2 2 0 1 0 4 0V10h1.5v6H17v3.5H9V16H5.5v-6H9V6.5a2 2 0 1 1 0-3z" transform="translate(0 1.5)"/>`,
  arrow: `<path d="M6 18 18 6M8.5 6H18v9.5"/>`,
  star: `<path d="m12 3 2.7 5.7 6.3.9-4.6 4.4 1.2 6.2-5.6-3-5.6 3 1.2-6.2L3 9.6l6.3-.9z"/>`,
  briefcase: `<rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M9 7V4.5h6V7M3 12.5h18"/>`,
  pin: `<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="9.8" r="2.6"/>`,
  check: `<path d="m4.5 12.5 5 5 10-11"/>`,
  bolt: `<path d="M13.5 2 5 13.5h5.5L9.8 22 19 10.2h-5.2z"/>`,
  users: `<circle cx="9" cy="8" r="3.4"/><path d="M3 20c.6-3.5 3.1-5.6 6-5.6s5.4 2.1 6 5.6"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.5M17.4 14.6c2.1.5 3.4 2.3 3.8 5.4"/>`,
  target: `<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.1"/>`,
  monitor: `<rect x="2.5" y="4" width="19" height="12.5" rx="1.5"/><path d="M8.5 20.5h7M12 16.5v4"/>`,
  film: `<rect x="2.5" y="4.5" width="19" height="15" rx="1.5"/><path d="M7 4.5v15M17 4.5v15M2.5 12h19M2.5 8.2h4.5M2.5 15.8h4.5M17 8.2h4.5M17 15.8h4.5"/>`,
  bag: `<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>`,
  compass: `<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>`,
  quote: `<path d="M9.5 6C6.5 7.4 5 9.7 5 12.4c0 2 1.2 3.6 3 3.6s3-1.3 3-3c0-1.7-1.1-2.8-2.6-2.8-.3 0-.6 0-.9.1.4-1.4 1.5-2.5 3-3.3zM19.5 6C16.5 7.4 15 9.7 15 12.4c0 2 1.2 3.6 3 3.6s3-1.3 3-3c0-1.7-1.1-2.8-2.6-2.8-.3 0-.6 0-.9.1.4-1.4 1.5-2.5 3-3.3z"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  menu: `<path d="M3 7h18M3 12h18M3 17h18"/>`,
  close: `<path d="m5 5 14 14M19 5 5 19"/>`,
  download: `<path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 20h16"/>`,
  calendar: `<rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/>`,
  tag: `<path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="7.5" cy="7.5" r="1.4"/>`,
  link: `<path d="M10 14a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7L11.5 6.8"/><path d="M14 10a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7l1.3-1.3"/>`,
  folder: `<path d="M3 6.5h6l2 2.5h10V20H3z"/>`,
  eye: `<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>`,
  trash: `<path d="M4 7h16M9.5 7V4h5v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>`,
  edit: `<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="m14.5 5.5 4 4"/>`,
  logout: `<path d="M9 4H4v16h5M14 8l4 4-4 4M8 12h10"/>`,
  dots: `<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>`,
  grid: `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
  shieldCheck: `<path d="M12 2.8 20 6v6.1c0 4.6-3.4 7.6-8 9.1-4.6-1.5-8-4.5-8-9.1V6z"/><path d="m8.5 11.8 2.4 2.4 4.6-4.9"/>`,
  doc: `<path d="M6 2.5h8l4 4v15H6z"/><path d="M14 2.5v4h4M9 12h6M9 16h6"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.5 2"/>`
};

function icon(name, size = 24, cls = '') {
  const body = ICONS[name] || ICONS.spark;
  return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}

module.exports = { ICONS, icon };
