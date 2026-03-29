import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const API_URL = "https://fakestoreapi.com/products";
const PER_PAGE = 8;
const MAX_PRICE = 1000;

const CATEGORIES = ["All", "electronics", "jewelery", "men's clothing", "women's clothing"];

const SORT_OPTIONS = [
  { label: "Recommended",       value: "recommended" },
  { label: "Newest First",      value: "newest"      },
  { label: "Price: Low → High", value: "price_asc"   },
  { label: "Price: High → Low", value: "price_desc"  },
  { label: "Top Rated",         value: "rating"      },
];

// Each nav item maps to a category filter (or a special page)
const NAV_ITEMS = [
  { label: "Shop",        action: "All",              type: "filter" },
  { label: "New In",      action: "newest",            type: "sort"   },
  { label: "Women",       action: "women's clothing",  type: "filter" },
  { label: "Men",         action: "men's clothing",    type: "filter" },
  { label: "Accessories", action: "jewelery",          type: "filter" },
  { label: "Beauty",      action: "All",               type: "filter" },
  { label: "Sale",        action: "sale",              type: "page"   },
];

/* ─────────────────────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --cream:#FAF7F2; --ink:#1A1612; --mid:#7A6A58;
  --accent:#C8A96E; --accent-l:#EDD9A3;
  --border:#E5DDD3; --surface:#F2EDE6; --white:#FFFFFF; --red:#C0392B;
  --green:#2D7D46;
}

html { scroll-behavior: smooth; }
body { font-family:'DM Sans',sans-serif; background:var(--cream); color:var(--ink); min-height:100vh; }

/* ── HEADER ── */
.plp-header { position:sticky; top:0; z-index:200; background:var(--cream); border-bottom:1px solid var(--border); }
.header-top { display:flex; align-items:center; justify-content:space-between; padding:0 48px; height:64px; gap:24px; }
.logo { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:600; letter-spacing:.06em; color:var(--ink); text-decoration:none; white-space:nowrap; cursor:pointer; border:none; background:none; }
.logo span { color:var(--accent); }

.header-search { flex:1; max-width:420px; position:relative; }
.header-search input { width:100%; padding:9px 36px 9px 40px; border:1px solid var(--border); border-radius:4px; background:var(--surface); font-family:'DM Sans',sans-serif; font-size:13px; color:var(--ink); outline:none; transition:border-color .2s,background .2s; }
.header-search input::placeholder { color:var(--mid); }
.header-search input:focus { border-color:var(--accent); background:var(--white); }
.search-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--mid); pointer-events:none; }
.search-clear { position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--mid); cursor:pointer; font-size:16px; line-height:1; padding:2px; border-radius:50%; transition:color .2s; }
.search-clear:hover { color:var(--ink); }

.header-actions { display:flex; align-items:center; gap:16px; }
.action-btn { background:none; border:none; cursor:pointer; color:var(--ink); display:flex; align-items:center; gap:6px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; padding:6px 4px; border-radius:3px; transition:color .2s; position:relative; }
.action-btn:hover { color:var(--accent); }
.action-btn.active-btn { color:var(--accent); }
.cart-badge { position:absolute; top:-3px; right:-7px; background:var(--accent); color:var(--white); font-size:9px; font-weight:700; min-width:16px; height:16px; border-radius:8px; display:flex; align-items:center; justify-content:center; padding:0 3px; }

/* ── NAV ── */
.nav-bar { border-top:1px solid var(--border); padding:0 48px; display:flex; align-items:center; overflow-x:auto; scrollbar-width:none; }
.nav-bar::-webkit-scrollbar { display:none; }
.nav-btn { font-size:12.5px; font-weight:500; letter-spacing:.08em; text-transform:uppercase; color:var(--mid); background:none; border:none; cursor:pointer; padding:12px 18px; border-bottom:2px solid transparent; white-space:nowrap; transition:color .2s,border-color .2s; font-family:'DM Sans',sans-serif; }
.nav-btn:hover, .nav-btn.active { color:var(--ink); border-bottom-color:var(--accent); }
.nav-btn.sale-btn { color:var(--red); }
.nav-btn.sale-btn:hover, .nav-btn.sale-btn.active { color:var(--red); border-bottom-color:var(--red); }

/* ── HERO ── */
.hero-strip { background:var(--ink); text-align:center; padding:48px 24px 40px; position:relative; overflow:hidden; }
.hero-strip::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 60% 40%,rgba(200,169,110,.12) 0%,transparent 65%); pointer-events:none; }
.hero-eyebrow { font-size:11px; letter-spacing:.25em; text-transform:uppercase; color:var(--accent); margin-bottom:10px; }
.hero-title { font-family:'Cormorant Garamond',serif; font-size:clamp(32px,5vw,56px); font-weight:300; letter-spacing:.04em; line-height:1.1; color:var(--cream); }
.hero-title em { font-style:italic; color:var(--accent-l); }
.hero-sub { margin-top:12px; font-size:14px; color:var(--mid); font-weight:300; }

/* ── BREADCRUMB ── */
.breadcrumb { padding:12px 48px; font-size:12px; color:var(--mid); display:flex; align-items:center; gap:6px; border-bottom:1px solid var(--border); flex-wrap:wrap; }
.breadcrumb button { background:none; border:none; cursor:pointer; color:var(--mid); font-family:'DM Sans',sans-serif; font-size:12px; transition:color .2s; padding:0; }
.breadcrumb button:hover { color:var(--accent); }
.breadcrumb span { color:var(--ink); text-transform:capitalize; }

/* ── TOOLBAR ── */
.toolbar { display:flex; align-items:center; justify-content:space-between; padding:12px 48px; border-bottom:1px solid var(--border); gap:12px; flex-wrap:wrap; }
.toolbar-left { display:flex; align-items:center; gap:12px; }
.count-label { font-size:13px; color:var(--mid); }
.count-label strong { color:var(--ink); font-weight:500; }
.filter-toggle-btn { display:flex; align-items:center; gap:6px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; padding:7px 14px; border:1px solid var(--border); background:var(--white); border-radius:4px; cursor:pointer; color:var(--ink); transition:all .2s; }
.filter-toggle-btn:hover,.filter-toggle-btn.active { background:var(--ink); color:var(--cream); border-color:var(--ink); }
.toolbar-right { display:flex; align-items:center; gap:10px; }
.sort-select { font-family:'DM Sans',sans-serif; font-size:13px; padding:7px 32px 7px 12px; border:1px solid var(--border); border-radius:4px; background:var(--white); color:var(--ink); cursor:pointer; outline:none; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%237A6A58'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; }
.sort-select:focus { border-color:var(--accent); }
.view-btns { display:flex; border:1px solid var(--border); border-radius:4px; overflow:hidden; }
.view-btn { background:var(--white); border:none; padding:7px 10px; cursor:pointer; color:var(--mid); display:flex; align-items:center; transition:background .15s,color .15s; }
.view-btn:not(:last-child) { border-right:1px solid var(--border); }
.view-btn.active { background:var(--ink); color:var(--cream); }

/* ── LAYOUT ── */
.main-layout { display:flex; align-items:flex-start; padding:0 48px 64px; gap:32px; }

/* ── SIDEBAR ── */
.sidebar { width:240px; flex-shrink:0; padding-top:24px; transition:all .3s ease; overflow:hidden; }
.sidebar.hidden { width:0; opacity:0; pointer-events:none; padding:0; }
.sidebar-section { margin-bottom:24px; padding-bottom:24px; border-bottom:1px solid var(--border); }
.sidebar-section:last-child { border-bottom:none; }
.sidebar-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.sidebar-heading { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:400; }
.clear-btn { font-size:12px; color:var(--mid); text-decoration:underline; cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; transition:color .2s; }
.clear-btn:hover { color:var(--red); }
.section-title { font-size:11px; font-weight:500; letter-spacing:.15em; text-transform:uppercase; color:var(--mid); margin-bottom:12px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; user-select:none; padding:4px 0; }
.section-title svg { transition:transform .2s; flex-shrink:0; }
.section-title.open svg { transform:rotate(180deg); }
.filter-options { display:flex; flex-direction:column; gap:8px; }
.filter-option { display:flex; align-items:center; gap:10px; cursor:pointer; font-size:13.5px; color:var(--ink); padding:2px 0; transition:color .15s; text-transform:capitalize; }
.filter-option:hover { color:var(--accent); }
.filter-option input[type="checkbox"] { width:15px; height:15px; accent-color:var(--accent); cursor:pointer; flex-shrink:0; }
.price-slider-wrap { position:relative; height:4px; background:var(--border); border-radius:2px; margin:20px 0 8px; }
.price-fill { position:absolute; height:100%; background:var(--accent); border-radius:2px; pointer-events:none; }
.price-slider-wrap input[type="range"] { position:absolute; width:100%; height:4px; background:transparent; appearance:none; pointer-events:none; top:0; margin:0; }
.price-slider-wrap input[type="range"]::-webkit-slider-thumb { appearance:none; width:16px; height:16px; border-radius:50%; background:var(--white); border:2px solid var(--accent); cursor:pointer; pointer-events:all; margin-top:-6px; box-shadow:0 1px 4px rgba(0,0,0,.15); }
.price-slider-wrap input[type="range"]::-moz-range-thumb { width:16px; height:16px; border-radius:50%; background:var(--white); border:2px solid var(--accent); cursor:pointer; pointer-events:all; }
.price-labels { display:flex; justify-content:space-between; font-size:12px; color:var(--mid); margin-top:12px; }
.rating-row { display:flex; align-items:center; gap:8px; cursor:pointer; padding:4px 6px; border-radius:4px; transition:background .15s; font-size:13px; }
.rating-row:hover { background:var(--surface); }
.rating-row.selected { background:var(--surface); font-weight:500; color:var(--ink); }
.rating-stars-display { color:var(--accent); letter-spacing:-1px; font-size:14px; }

/* ── PRODUCT AREA ── */
.product-area { flex:1; min-width:0; padding-top:24px; }
.category-chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }
.chip { font-size:12.5px; padding:6px 16px; border:1px solid var(--border); border-radius:100px; background:var(--white); color:var(--mid); cursor:pointer; transition:all .2s; white-space:nowrap; font-family:'DM Sans',sans-serif; text-transform:capitalize; }
.chip:hover { border-color:var(--accent); color:var(--ink); }
.chip.active { background:var(--ink); border-color:var(--ink); color:var(--cream); }

/* ── PRODUCT GRID ── */
.product-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
.product-grid.list-view { grid-template-columns:1fr; gap:16px; }

/* ── PRODUCT CARD ── */
.product-card { background:var(--white); border:1px solid var(--border); border-radius:6px; overflow:hidden; cursor:pointer; position:relative; transition:box-shadow .25s,transform .25s; animation:fadeUp .4s ease both; }
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
.product-card:hover { box-shadow:0 8px 32px rgba(26,22,18,.12); transform:translateY(-3px); }
.product-card.list-card { display:flex; flex-direction:row; }
.card-image-wrap { position:relative; overflow:hidden; background:var(--surface); aspect-ratio:1/1; flex-shrink:0; }
.product-card.list-card .card-image-wrap { width:180px; aspect-ratio:auto; }
.card-image-wrap img { width:100%; height:100%; object-fit:contain; padding:16px; transition:transform .4s; display:block; }
.product-card:hover .card-image-wrap img { transform:scale(1.06); }
.card-badge { position:absolute; top:8px; left:8px; background:var(--accent); color:var(--white); font-size:10px; font-weight:600; letter-spacing:.05em; padding:3px 8px; border-radius:2px; text-transform:uppercase; pointer-events:none; }
.card-badge.sale { background:var(--red); }
.wishlist-btn { position:absolute; top:8px; right:8px; background:var(--white); border:1px solid var(--border); border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; opacity:0; }
.product-card:hover .wishlist-btn,.wishlist-btn.wishlisted { opacity:1; }
.wishlist-btn:hover,.wishlist-btn.wishlisted { background:var(--ink); border-color:var(--ink); color:var(--cream); }
.card-body { padding:14px 16px 16px; flex:1; display:flex; flex-direction:column; }
.card-category { font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--mid); margin-bottom:5px; }
.card-title { font-family:'Cormorant Garamond',serif; font-size:15px; font-weight:400; line-height:1.4; color:var(--ink); margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; flex:1; }
.card-rating { display:flex; align-items:center; gap:5px; margin-bottom:10px; }
.card-stars { font-size:12px; color:var(--accent); letter-spacing:-1px; }
.card-count { font-size:11px; color:var(--mid); }
.card-footer { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:auto; }
.card-price { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:600; color:var(--ink); }
.card-price.sale-price { color:var(--red); }
.orig-price { font-size:12px; color:var(--mid); text-decoration:line-through; margin-left:4px; }
.add-to-cart-btn { background:var(--ink); color:var(--cream); border:none; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:500; padding:7px 14px; border-radius:3px; cursor:pointer; transition:background .2s; white-space:nowrap; }
.add-to-cart-btn:hover { background:var(--accent); }
.add-to-cart-btn:active { transform:scale(.97); }

/* ── SKELETON ── */
.skeleton-card { background:var(--white); border:1px solid var(--border); border-radius:6px; overflow:hidden; }
.skeleton { background:linear-gradient(90deg,var(--surface) 25%,var(--border) 50%,var(--surface) 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:4px; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.sk-img { height:200px; border-radius:0; }
.sk-body { padding:14px 16px 16px; display:flex; flex-direction:column; gap:8px; }
.sk-line { height:12px; }

/* ── EMPTY / ERROR ── */
.empty-state { text-align:center; padding:72px 24px; color:var(--mid); }
.empty-icon { font-size:48px; margin-bottom:16px; }
.empty-state h3 { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:400; color:var(--ink); margin-bottom:8px; }
.empty-state p { font-size:14px; margin-bottom:20px; }

/* ── PAGINATION ── */
.pagination { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:48px; flex-wrap:wrap; }
.page-btn { width:36px; height:36px; border:1px solid var(--border); background:var(--white); border-radius:4px; font-family:'DM Sans',sans-serif; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--ink); transition:all .2s; }
.page-btn:hover:not(:disabled) { border-color:var(--accent); color:var(--accent); }
.page-btn.active { background:var(--ink); border-color:var(--ink); color:var(--cream); }
.page-btn:disabled { opacity:.35; cursor:not-allowed; }

/* ── DRAWERS ── */
.drawer-overlay { position:fixed; inset:0; background:rgba(26,22,18,.45); z-index:300; animation:fadeIn .2s ease; }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.drawer { position:fixed; top:0; right:0; width:380px; max-width:100vw; height:100vh; background:var(--cream); z-index:301; display:flex; flex-direction:column; animation:slideIn .3s ease; box-shadow:-8px 0 40px rgba(0,0,0,.15); }
@keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
.drawer-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid var(--border); }
.drawer-header h2 { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:400; }
.drawer-close { background:none; border:none; cursor:pointer; font-size:22px; color:var(--mid); line-height:1; padding:4px; transition:color .2s; }
.drawer-close:hover { color:var(--ink); }
.drawer-body { flex:1; overflow-y:auto; padding:16px 24px; }
.drawer-empty { text-align:center; padding:60px 0; color:var(--mid); }
.drawer-empty p { font-size:15px; margin-top:10px; }
.cart-item { display:flex; gap:14px; padding:14px 0; border-bottom:1px solid var(--border); align-items:flex-start; }
.cart-item-img { width:68px; height:68px; background:var(--surface); border-radius:4px; object-fit:contain; padding:6px; flex-shrink:0; }
.cart-item-info { flex:1; min-width:0; }
.cart-item-title { font-family:'Cormorant Garamond',serif; font-size:14px; line-height:1.4; color:var(--ink); margin-bottom:5px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.cart-item-price { font-size:13px; font-weight:500; color:var(--accent); }
.cart-item-qty { display:flex; align-items:center; gap:8px; margin-top:6px; }
.qty-btn { width:24px; height:24px; border:1px solid var(--border); background:var(--white); border-radius:3px; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; transition:all .15s; color:var(--ink); }
.qty-btn:hover { background:var(--ink); color:var(--cream); border-color:var(--ink); }
.qty-val { font-size:13px; font-weight:500; min-width:20px; text-align:center; }
.remove-item { background:none; border:none; cursor:pointer; color:var(--mid); font-size:13px; margin-left:auto; transition:color .2s; align-self:flex-start; padding:2px; }
.remove-item:hover { color:var(--red); }
.drawer-footer { padding:16px 24px; border-top:1px solid var(--border); background:var(--cream); }
.cart-total { display:flex; justify-content:space-between; font-size:15px; font-weight:500; margin-bottom:14px; }
.cart-total span:last-child { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:600; }
.checkout-btn { width:100%; background:var(--ink); color:var(--cream); border:none; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; padding:14px; border-radius:4px; cursor:pointer; transition:background .2s; letter-spacing:.04em; }
.checkout-btn:hover { background:var(--accent); }

/* ── ACCOUNT PAGE ── */
.page-wrap { padding:40px 48px 80px; max-width:1000px; margin:0 auto; }
.page-title { font-family:'Cormorant Garamond',serif; font-size:36px; font-weight:300; color:var(--ink); margin-bottom:8px; }
.page-subtitle { font-size:14px; color:var(--mid); margin-bottom:40px; }
.account-grid { display:grid; grid-template-columns:240px 1fr; gap:32px; }
.account-nav { display:flex; flex-direction:column; gap:2px; }
.account-nav-btn { background:none; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13.5px; color:var(--mid); text-align:left; padding:10px 14px; border-radius:4px; transition:all .2s; display:flex; align-items:center; gap:10px; }
.account-nav-btn:hover { background:var(--surface); color:var(--ink); }
.account-nav-btn.active { background:var(--ink); color:var(--cream); }
.account-panel { background:var(--white); border:1px solid var(--border); border-radius:8px; padding:28px; }
.panel-title { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:400; margin-bottom:24px; color:var(--ink); }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
.form-group { display:flex; flex-direction:column; gap:6px; }
.form-group.full { grid-column:1/-1; }
.form-label { font-size:12px; font-weight:500; letter-spacing:.08em; text-transform:uppercase; color:var(--mid); }
.form-input { padding:10px 14px; border:1px solid var(--border); border-radius:4px; font-family:'DM Sans',sans-serif; font-size:14px; color:var(--ink); background:var(--surface); outline:none; transition:border-color .2s,background .2s; }
.form-input:focus { border-color:var(--accent); background:var(--white); }
.form-select { padding:10px 14px; border:1px solid var(--border); border-radius:4px; font-family:'DM Sans',sans-serif; font-size:14px; color:var(--ink); background:var(--surface); outline:none; appearance:none; cursor:pointer; }
.save-btn { background:var(--ink); color:var(--cream); border:none; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; padding:10px 24px; border-radius:4px; cursor:pointer; transition:background .2s; margin-top:8px; }
.save-btn:hover { background:var(--accent); }
.order-item { display:flex; gap:16px; padding:16px 0; border-bottom:1px solid var(--border); align-items:center; }
.order-item:last-child { border-bottom:none; }
.order-img { width:60px; height:60px; object-fit:contain; background:var(--surface); border-radius:4px; padding:6px; flex-shrink:0; }
.order-info { flex:1; }
.order-title { font-size:14px; color:var(--ink); font-weight:500; margin-bottom:4px; }
.order-meta { font-size:12px; color:var(--mid); }
.order-status { font-size:11px; font-weight:600; padding:3px 10px; border-radius:100px; letter-spacing:.05em; text-transform:uppercase; }
.status-delivered { background:#E8F5E9; color:#2E7D32; }
.status-processing { background:#FFF8E1; color:#F57F17; }
.addr-card { border:1px solid var(--border); border-radius:6px; padding:16px; margin-bottom:12px; position:relative; }
.addr-default { font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--accent); margin-bottom:8px; }
.addr-name { font-size:14px; font-weight:500; color:var(--ink); margin-bottom:4px; }
.addr-text { font-size:13px; color:var(--mid); line-height:1.6; }
.addr-actions { display:flex; gap:8px; margin-top:12px; }
.addr-btn { font-size:12px; color:var(--mid); background:none; border:1px solid var(--border); border-radius:3px; padding:4px 12px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .2s; }
.addr-btn:hover { border-color:var(--ink); color:var(--ink); }
.pref-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border); }
.pref-row:last-child { border-bottom:none; }
.pref-label { font-size:14px; color:var(--ink); }
.pref-sub { font-size:12px; color:var(--mid); margin-top:2px; }
.toggle { width:42px; height:24px; background:var(--border); border-radius:12px; position:relative; cursor:pointer; transition:background .2s; border:none; flex-shrink:0; }
.toggle.on { background:var(--accent); }
.toggle::after { content:''; position:absolute; top:3px; left:3px; width:18px; height:18px; background:var(--white); border-radius:50%; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
.toggle.on::after { transform:translateX(18px); }
.logout-btn { margin-top:20px; background:none; border:1px solid var(--border); color:var(--red); font-family:'DM Sans',sans-serif; font-size:13px; padding:9px 20px; border-radius:4px; cursor:pointer; transition:all .2s; }
.logout-btn:hover { background:var(--red); color:var(--white); border-color:var(--red); }

/* ── SALE PAGE ── */
.sale-hero { background:var(--red); color:var(--white); text-align:center; padding:48px 24px; position:relative; overflow:hidden; }
.sale-hero::before { content:'SALE'; position:absolute; font-size:200px; font-weight:900; color:rgba(255,255,255,.05); top:50%; left:50%; transform:translate(-50%,-50%); pointer-events:none; letter-spacing:.1em; white-space:nowrap; }
.sale-tag { font-size:11px; letter-spacing:.25em; text-transform:uppercase; opacity:.8; margin-bottom:8px; }
.sale-title { font-family:'Cormorant Garamond',serif; font-size:clamp(36px,5vw,64px); font-weight:300; line-height:1.1; }
.sale-sub { margin-top:10px; font-size:14px; opacity:.75; }
.sale-timer { display:flex; justify-content:center; gap:20px; margin-top:28px; }
.timer-block { text-align:center; }
.timer-num { font-family:'Cormorant Garamond',serif; font-size:40px; font-weight:600; line-height:1; }
.timer-label { font-size:10px; letter-spacing:.15em; text-transform:uppercase; opacity:.7; margin-top:2px; }

/* ── TOAST ── */
.toast-container { position:fixed; bottom:24px; right:24px; z-index:500; display:flex; flex-direction:column; gap:8px; pointer-events:none; }
.toast { background:var(--ink); color:var(--cream); font-size:13px; padding:12px 20px; border-radius:5px; display:flex; align-items:center; gap:10px; animation:toastIn .3s ease; box-shadow:0 4px 20px rgba(0,0,0,.2); pointer-events:all; }
.toast.success { border-left:3px solid var(--accent); }
.toast.error { border-left:3px solid var(--red); }
@keyframes toastIn { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }

/* ── FOOTER ── */
.plp-footer { background:var(--ink); color:var(--cream); padding:48px 48px 28px; }
.footer-grid { display:grid; grid-template-columns:1.5fr 1fr 1fr 1fr; gap:40px; margin-bottom:40px; }
.footer-brand .logo { color:var(--cream); font-size:22px; }
.footer-tagline { font-size:13px; color:var(--mid); margin-top:10px; line-height:1.7; max-width:220px; }
.footer-col h4 { font-size:11px; letter-spacing:.15em; text-transform:uppercase; color:var(--mid); margin-bottom:14px; }
.footer-col ul { list-style:none; display:flex; flex-direction:column; gap:9px; }
.footer-col ul li a { color:#BFB5A8; font-size:13.5px; text-decoration:none; transition:color .2s; }
.footer-col ul li a:hover { color:var(--accent); }
.footer-bottom { border-top:1px solid #2E2A25; padding-top:24px; display:flex; align-items:center; justify-content:space-between; font-size:12px; color:var(--mid); flex-wrap:wrap; gap:8px; }

/* ── RESPONSIVE ── */
@media(max-width:1200px) { .product-grid{grid-template-columns:repeat(3,1fr)} }
@media(max-width:1024px) {
  .header-top,.nav-bar,.breadcrumb,.toolbar,.main-layout,.page-wrap,.plp-footer{padding-left:24px;padding-right:24px}
  .product-grid{grid-template-columns:repeat(2,1fr)}
  .footer-grid{grid-template-columns:1fr 1fr;gap:28px}
  .account-grid{grid-template-columns:1fr}
  .account-nav{flex-direction:row;flex-wrap:wrap;gap:6px}
}
@media(max-width:768px) {
  .sidebar{display:none!important}
  .product-grid{grid-template-columns:repeat(2,1fr)}
  .footer-grid{grid-template-columns:1fr 1fr}
  .drawer{width:100vw}
  .form-row{grid-template-columns:1fr}
}
@media(max-width:540px) {
  .header-top{padding:0 16px}
  .nav-bar,.breadcrumb,.toolbar,.main-layout,.page-wrap,.plp-footer{padding-left:16px;padding-right:16px}
  .header-search{display:none}
  .product-grid{grid-template-columns:repeat(2,1fr);gap:10px}
  .toolbar{flex-direction:column;align-items:flex-start}
  .toolbar-right{width:100%;justify-content:flex-end}
  .footer-grid{grid-template-columns:1fr}
  .sale-timer{gap:12px}
  .timer-num{font-size:28px}
}
`;

/* ─────────────────────────────────────────────────────────────
   ICON HELPERS
───────────────────────────────────────────────────────────── */
const Ico = ({ d, size = 18, fill = "none", stroke = "currentColor", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const SearchIco = () => <Ico d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" size={16} />;
const GridIco   = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);
const ListIco   = () => <Ico d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={16} />;
const FilterIco = () => <Ico d="M22 3H2l8 9.46V19l4 2v-8.54z" size={15} />;
const ChevDown  = () => <Ico d="M6 9l6 6 6-6" size={13} />;
const ChevRight = () => <Ico d="M9 18l6-6-6-6" size={12} />;
const HeartIco  = ({ filled, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const CartIco   = () => <Ico d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" size={18} />;
const UserIco   = () => <Ico d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={18} />;
const PackageIco = () => <Ico d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" size={16} />;
const MapIco    = () => <Ico d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" size={16} />;
const BellIco   = () => <Ico d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" size={16} />;
const SettingsIco = () => <Ico d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" size={16} />;

function starString(r) { const n = Math.round(r || 0); return "★".repeat(n) + "☆".repeat(5 - n); }

/* ─────────────────────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton sk-img" />
      <div className="sk-body">
        <div className="skeleton sk-line" style={{ width: "50%" }} />
        <div className="skeleton sk-line" style={{ width: "85%" }} />
        <div className="skeleton sk-line" style={{ width: "85%" }} />
        <div className="skeleton sk-line" style={{ width: "35%" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────────────────────── */
function ProductCard({ product, isListView, onAddToCart, onToggleWishlist, wishlisted, index, isSale }) {
  const salePrice = isSale ? (product.price * 0.7).toFixed(2) : null;

  return (
    <article
      className={`product-card${isListView ? " list-card" : ""}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      aria-label={product.title}
    >
      <div className="card-image-wrap">
        <img src={product.image} alt={product.title} loading="lazy" />
        {isSale
          ? <span className="card-badge sale">30% Off</span>
          : (product.rating?.rate || 0) >= 4.5 && <span className="card-badge">Top Pick</span>
        }
        <button
          className={`wishlist-btn${wishlisted ? " wishlisted" : ""}`}
          onClick={e => { e.stopPropagation(); onToggleWishlist(product); }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
        >
          <HeartIco filled={wishlisted} />
        </button>
      </div>
      <div className="card-body">
        <p className="card-category">{product.category}</p>
        <h2 className="card-title">{product.title}</h2>
        <div className="card-rating">
          <span className="card-stars">{starString(product.rating?.rate)}</span>
          <span className="card-count">({product.rating?.count || 0})</span>
        </div>
        <div className="card-footer">
          <span>
            <span className={`card-price${isSale ? " sale-price" : ""}`}>
              ${isSale ? salePrice : product.price.toFixed(2)}
            </span>
            {isSale && <span className="orig-price">${product.price.toFixed(2)}</span>}
          </span>
          <button className="add-to-cart-btn" onClick={e => { e.stopPropagation(); onAddToCart(product); }}>
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
   CART DRAWER
───────────────────────────────────────────────────────────── */
function CartDrawer({ items, onClose, onRemove, onQtyChange }) {
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <div className="drawer-header">
          <h2>Cart ({count})</h2>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">
          {items.length === 0
            ? <div className="drawer-empty"><CartIco /><p>Your cart is empty</p></div>
            : items.map(({ product, qty }) => (
              <div key={product.id} className="cart-item">
                <img className="cart-item-img" src={product.image} alt={product.title} />
                <div className="cart-item-info">
                  <p className="cart-item-title">{product.title}</p>
                  <p className="cart-item-price">${(product.price * qty).toFixed(2)}</p>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => onQtyChange(product.id, qty - 1)}>−</button>
                    <span className="qty-val">{qty}</span>
                    <button className="qty-btn" onClick={() => onQtyChange(product.id, qty + 1)}>+</button>
                  </div>
                </div>
                <button className="remove-item" onClick={() => onRemove(product.id)}>✕</button>
              </div>
            ))
          }
        </div>
        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            <button className="checkout-btn">Proceed to Checkout →</button>
          </div>
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   WISHLIST DRAWER
───────────────────────────────────────────────────────────── */
function WishlistDrawer({ items, onClose, onRemove, onAddToCart }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer" role="dialog" aria-modal="true" aria-label="Wishlist">
        <div className="drawer-header">
          <h2>Wishlist ({items.length})</h2>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">
          {items.length === 0
            ? <div className="drawer-empty"><HeartIco size={40} /><p>Your wishlist is empty</p></div>
            : items.map(p => (
              <div key={p.id} className="cart-item">
                <img className="cart-item-img" src={p.image} alt={p.title} />
                <div className="cart-item-info">
                  <p className="cart-item-title">{p.title}</p>
                  <p className="cart-item-price">${p.price.toFixed(2)}</p>
                  <button className="add-to-cart-btn" style={{ marginTop: 8, fontSize: 11 }}
                    onClick={() => onAddToCart(p)}>Add to Cart</button>
                </div>
                <button className="remove-item" onClick={() => onRemove(p.id)}>✕</button>
              </div>
            ))
          }
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACCOUNT PAGE
───────────────────────────────────────────────────────────── */
const ACCOUNT_TABS = [
  { id: "profile",    label: "My Profile",    icon: UserIco    },
  { id: "orders",     label: "My Orders",     icon: PackageIco },
  { id: "addresses",  label: "Addresses",     icon: MapIco     },
  { id: "prefs",      label: "Preferences",   icon: BellIco    },
  { id: "settings",   label: "Settings",      icon: SettingsIco},
];

const MOCK_ORDERS = [
  { id: "#ORD-4821", date: "12 Mar 2025", items: 3, total: 142.50, status: "Delivered",  img: "https://fakestoreapi.com/img/81fAn7AX2yL._AC_UY879_.jpg" },
  { id: "#ORD-4719", date: "28 Feb 2025", items: 1, total:  55.99, status: "Delivered",  img: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg" },
  { id: "#ORD-4612", date: "14 Feb 2025", items: 2, total:  89.00, status: "Processing", img: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg" },
];

function AccountPage({ onBack, cartItems }) {
  const [tab, setTab] = useState("profile");
  const [prefs, setPrefs] = useState({ email: true, sms: false, push: true, offers: true });
  const [profile, setProfile] = useState({ firstName: "Alex", lastName: "Johnson", email: "alex@example.com", phone: "+91 98765 43210", dob: "1995-06-15", gender: "prefer-not" });

  const togglePref = key => setPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="page-wrap" style={{ animation: "fadeUp .3s ease" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mid)", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 24, fontFamily: "'DM Sans',sans-serif" }}>
        ← Back to Shop
      </button>
      <h1 className="page-title">My Account</h1>
      <p className="page-subtitle">Manage your profile, orders, and preferences</p>

      <div className="account-grid">
        {/* Sidebar tabs */}
        <nav className="account-nav" aria-label="Account sections">
          {ACCOUNT_TABS.map(t => (
            <button
              key={t.id}
              className={`account-nav-btn${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              <t.icon /> {t.label}
            </button>
          ))}
          <button className="logout-btn" style={{ marginTop: 16 }}>Log Out</button>
        </nav>

        {/* Panel */}
        <div className="account-panel" key={tab} style={{ animation: "fadeUp .25s ease" }}>

          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <>
              <h3 className="panel-title">Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" value={profile.dob} onChange={e => setProfile(p => ({ ...p, dob: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select form-input" value={profile.gender} onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <button className="save-btn">Save Changes</button>
            </>
          )}

          {/* ── ORDERS ── */}
          {tab === "orders" && (
            <>
              <h3 className="panel-title">Order History</h3>
              {MOCK_ORDERS.map(o => (
                <div key={o.id} className="order-item">
                  <img className="order-img" src={o.img} alt="Order" />
                  <div className="order-info">
                    <p className="order-title">{o.id}</p>
                    <p className="order-meta">{o.date} · {o.items} item{o.items !== 1 ? "s" : ""} · <strong>${o.total.toFixed(2)}</strong></p>
                  </div>
                  <span className={`order-status ${o.status === "Delivered" ? "status-delivered" : "status-processing"}`}>
                    {o.status}
                  </span>
                </div>
              ))}
              {cartItems.length > 0 && (
                <p style={{ marginTop: 20, fontSize: 13, color: "var(--mid)" }}>
                  You have {cartItems.reduce((s, i) => s + i.qty, 0)} item{cartItems.reduce((s, i) => s + i.qty, 0) !== 1 ? "s" : ""} pending in your cart.
                </p>
              )}
            </>
          )}

          {/* ── ADDRESSES ── */}
          {tab === "addresses" && (
            <>
              <h3 className="panel-title">Saved Addresses</h3>
              <div className="addr-card">
                <p className="addr-default">Default</p>
                <p className="addr-name">Alex Johnson</p>
                <p className="addr-text">42, MG Road, Banjara Hills<br />Hyderabad, Telangana 500034<br />India · +91 98765 43210</p>
                <div className="addr-actions">
                  <button className="addr-btn">Edit</button>
                  <button className="addr-btn">Remove</button>
                </div>
              </div>
              <div className="addr-card">
                <p className="addr-name">Office</p>
                <p className="addr-text">Appscrip Technologies, Hitech City<br />Hyderabad, Telangana 500081<br />India · +91 40 1234 5678</p>
                <div className="addr-actions">
                  <button className="addr-btn">Edit</button>
                  <button className="addr-btn">Set as Default</button>
                  <button className="addr-btn">Remove</button>
                </div>
              </div>
              <button className="save-btn" style={{ marginTop: 16 }}>+ Add New Address</button>
            </>
          )}

          {/* ── PREFERENCES ── */}
          {tab === "prefs" && (
            <>
              <h3 className="panel-title">Notification Preferences</h3>
              {[
                { key: "email",  label: "Email Notifications",  sub: "Order updates, promotions, newsletters" },
                { key: "sms",    label: "SMS Alerts",           sub: "Delivery updates via text message" },
                { key: "push",   label: "Push Notifications",   sub: "Browser or app alerts" },
                { key: "offers", label: "Offers & Deals",       sub: "Exclusive discounts and sale alerts" },
              ].map(({ key, label, sub }) => (
                <div key={key} className="pref-row">
                  <div>
                    <p className="pref-label">{label}</p>
                    <p className="pref-sub">{sub}</p>
                  </div>
                  <button
                    className={`toggle${prefs[key] ? " on" : ""}`}
                    onClick={() => togglePref(key)}
                    aria-pressed={prefs[key]}
                    aria-label={label}
                  />
                </div>
              ))}
            </>
          )}

          {/* ── SETTINGS ── */}
          {tab === "settings" && (
            <>
              <h3 className="panel-title">Account Settings</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select className="form-select form-input">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Telugu</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-select form-input">
                    <option>USD – US Dollar</option>
                    <option>INR – Indian Rupee</option>
                    <option>EUR – Euro</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="Enter new password" />
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" placeholder="Confirm new password" />
              </div>
              <button className="save-btn">Save Settings</button>
              <br />
              <button style={{ marginTop: 24, background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
                Delete Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SALE PAGE
───────────────────────────────────────────────────────────── */
function SalePage({ products, onAddToCart, onToggleWishlist, wishlistIds, onBack }) {
  const [timeLeft, setTimeLeft] = useState({ h: 11, m: 47, s: 23 });

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const saleProducts = products.filter(p => p.rating?.rate >= 4.0).slice(0, 12);

  const pad = n => String(n).padStart(2, "0");

  return (
    <>
      <section className="sale-hero">
        <p className="sale-tag">Limited Time</p>
        <h1 className="sale-title">End of Season <em style={{ fontStyle: "italic", fontFamily: "'Cormorant Garamond',serif" }}>Sale</em></h1>
        <p className="sale-sub">Up to 30% off on selected items</p>
        <div className="sale-timer">
          {[["Hours", timeLeft.h], ["Minutes", timeLeft.m], ["Seconds", timeLeft.s]].map(([label, val]) => (
            <div key={label} className="timer-block">
              <div className="timer-num">{pad(val)}</div>
              <div className="timer-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ padding: "24px 48px 64px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--mid)", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 24, fontFamily: "'DM Sans',sans-serif" }}>
          ← Back to Shop
        </button>
        <div className="product-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          {saleProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} isListView={false} isSale
              onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} wishlisted={wishlistIds.has(p.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────── */
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type || "success"}`}>
          {t.type === "error" ? "✕" : "✓"} {t.message}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────────────────────── */
export default function App() {
  /* ── DATA ── */
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  /* ── PAGE / NAVIGATION ── */
  const [page, setPage]           = useState("shop"); // "shop" | "account" | "sale"
  const [activeNav, setActiveNav] = useState("Shop");

  /* ── FILTERS ── */
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("All");
  const [sort, setSort]           = useState("recommended");
  const [minPrice, setMinPrice]   = useState(0);
  const [maxPrice, setMaxPrice]   = useState(MAX_PRICE);
  const [minRating, setMinRating] = useState(0);
  const [openSections, setOpenSections] = useState({ categories: true, price: true, rating: true });

  /* ── UI ── */
  const [isListView, setIsListView]   = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  /* ── CART ── */
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart]   = useState(false);

  /* ── WISHLIST ── */
  const [wishlist, setWishlist]       = useState([]);
  const [showWishlist, setShowWishlist] = useState(false);

  /* ── TOASTS ── */
  const [toasts, setToasts] = useState([]);
  const toastRef = useRef(0);

  /* ── FETCH ── */
  useEffect(() => {
    fetch(API_URL)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => { setError("Failed to load products. Please check your connection."); setLoading(false); });
  }, []);

  /* ── TOAST ── */
  const addToast = useCallback((message, type = "success") => {
    const id = ++toastRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  /* ── CART ACTIONS ── */
  const handleAddToCart = useCallback(product => {
    setCartItems(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      return ex
        ? prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { product, qty: 1 }];
    });
    addToast(`"${product.title.slice(0, 28)}…" added to cart`);
  }, [addToast]);

  const handleRemoveCart   = useCallback(id => { setCartItems(prev => prev.filter(i => i.product.id !== id)); addToast("Item removed"); }, [addToast]);
  const handleQtyChange    = useCallback((id, qty) => {
    if (qty < 1) { setCartItems(prev => prev.filter(i => i.product.id !== id)); addToast("Item removed"); }
    else setCartItems(prev => prev.map(i => i.product.id === id ? { ...i, qty } : i));
  }, [addToast]);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  /* ── WISHLIST ACTIONS ── */
  const handleToggleWishlist = useCallback(product => {
    setWishlist(prev => {
      const ex = prev.find(p => p.id === product.id);
      if (ex) { addToast("Removed from wishlist"); return prev.filter(p => p.id !== product.id); }
      addToast("Saved to wishlist ♥"); return [...prev, product];
    });
  }, [addToast]);

  const handleRemoveWishlist = useCallback(id => { setWishlist(prev => prev.filter(p => p.id !== id)); addToast("Removed from wishlist"); }, [addToast]);

  const wishlistIds = useMemo(() => new Set(wishlist.map(p => p.id)), [wishlist]);

  /* ── NAV CLICK ── */
  const handleNavClick = useCallback((item) => {
    setActiveNav(item.label);
    setShowCart(false);
    setShowWishlist(false);

    if (item.type === "page" && item.action === "sale") {
      setPage("sale");
      return;
    }
    setPage("shop");

    if (item.type === "filter") {
      setCategory(item.action);
      setSort("recommended");
    } else if (item.type === "sort") {
      setCategory("All");
      setSort(item.action);
    }
    setCurrentPage(1);
    setSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ── FILTER LOGIC ── */
  const filtered = useMemo(() => {
    return products
      .filter(p => category === "All" || p.category === category)
      .filter(p => !search.trim() || p.title.toLowerCase().includes(search.toLowerCase()))
      .filter(p => p.price >= minPrice && p.price <= (maxPrice >= MAX_PRICE ? Infinity : maxPrice))
      .filter(p => (p.rating?.rate || 0) >= minRating)
      .sort((a, b) => {
        if (sort === "price_asc")  return a.price - b.price;
        if (sort === "price_desc") return b.price - a.price;
        if (sort === "rating")     return (b.rating?.rate || 0) - (a.rating?.rate || 0);
        if (sort === "newest")     return b.id - a.id;
        return 0;
      });
  }, [products, category, search, minPrice, maxPrice, minRating, sort]);

  /* ── RESET PAGE on filter change ── */
  useEffect(() => { setCurrentPage(1); }, [category, search, minPrice, maxPrice, minRating, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const paged      = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const clearFilters = () => {
    setCategory("All"); setSearch(""); setMinPrice(0); setMaxPrice(MAX_PRICE);
    setMinRating(0); setSort("recommended"); setCurrentPage(1);
  };

  const activeFilters = (category !== "All" ? 1 : 0) + (minPrice > 0 || maxPrice < MAX_PRICE ? 1 : 0) + (minRating > 0 ? 1 : 0) + (search ? 1 : 0);

  const handleMinPrice = v => { if (v <= maxPrice) setMinPrice(v); };
  const handleMaxPrice = v => { if (v >= minPrice) setMaxPrice(v); };

  const goHome = () => { setPage("shop"); setActiveNav("Shop"); setCategory("All"); setSort("recommended"); setCurrentPage(1); };

  /* ── HERO CONTENT based on active nav ── */
  const heroMap = {
    "Shop":        { eye: "Spring / Summer 2025", title: <>Discover Our <em>Collection</em></>, sub: "Curated picks for every style" },
    "New In":      { eye: "Just Arrived",         title: <>What's <em>New</em></>,            sub: "Fresh arrivals, updated daily" },
    "Women":       { eye: "Women's Edit",          title: <>Style for <em>Her</em></>,         sub: "Elegant pieces for every occasion" },
    "Men":         { eye: "Men's Collection",      title: <>Dressed for <em>Him</em></>,       sub: "Sharp looks, everyday essentials" },
    "Accessories": { eye: "Fine Accessories",      title: <>Details that <em>Dazzle</em></>,   sub: "Jewellery & finishing touches" },
    "Beauty":      { eye: "Beauty Edit",           title: <>Feel <em>Beautiful</em></>,        sub: "Glow from inside out" },
  };
  const hero = heroMap[activeNav] || heroMap["Shop"];

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "ItemList", "name": "Product Listing",
        "itemListElement": products.slice(0, 10).map((p, i) => ({
          "@type": "ListItem", "position": i + 1,
          "item": { "@type": "Product", "name": p.title, "image": p.image,
            "offers": { "@type": "Offer", "price": p.price, "priceCurrency": "USD" } }
        }))
      })}} />

      {/* ══════════ HEADER ══════════ */}
      <header className="plp-header" role="banner">
        <div className="header-top">
          <button className="logo" onClick={goHome} aria-label="Go to home">Maison<span>.</span></button>

          <div className="header-search" role="search">
            <span className="search-icon"><SearchIco /></span>
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage("shop"); }}
              aria-label="Search products"
            />
            {search && <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search">✕</button>}
          </div>

          <div className="header-actions">
            <button
              className={`action-btn${page === "account" ? " active-btn" : ""}`}
              onClick={() => { setPage(p => p === "account" ? "shop" : "account"); setShowCart(false); setShowWishlist(false); }}
              aria-label="Account"
            >
              <UserIco />
              <span>Account</span>
            </button>

            <button
              className={`action-btn${showWishlist ? " active-btn" : ""}`}
              onClick={() => { setShowWishlist(v => !v); setShowCart(false); }}
              aria-label={`Wishlist (${wishlist.length} items)`}
            >
              <HeartIco filled={wishlist.length > 0} />
              <span>Wishlist{wishlist.length > 0 ? ` (${wishlist.length})` : ""}</span>
            </button>

            <button
              className={`action-btn${showCart ? " active-btn" : ""}`}
              onClick={() => { setShowCart(v => !v); setShowWishlist(false); }}
              aria-label={`Cart (${cartCount} items)`}
              style={{ position: "relative" }}
            >
              <CartIco />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              <span>Cart</span>
            </button>
          </div>
        </div>

        <nav className="nav-bar" aria-label="Main navigation">
          {NAV_ITEMS.map(item => (
            <button
              key={item.label}
              className={`nav-btn${activeNav === item.label ? " active" : ""}${item.label === "Sale" ? " sale-btn" : ""}`}
              onClick={() => handleNavClick(item)}
              aria-current={activeNav === item.label ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ══════════ PAGE ROUTER ══════════ */}

      {/* ── ACCOUNT PAGE ── */}
      {page === "account" && (
        <AccountPage onBack={goHome} cartItems={cartItems} />
      )}

      {/* ── SALE PAGE ── */}
      {page === "sale" && (
        <SalePage
          products={products}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          wishlistIds={wishlistIds}
          onBack={goHome}
        />
      )}

      {/* ── MAIN SHOP PAGE ── */}
      {page === "shop" && (
        <>
          {/* HERO */}
          <section className="hero-strip" aria-labelledby="hero-h">
            <p className="hero-eyebrow">{hero.eye}</p>
            <h1 id="hero-h" className="hero-title">{hero.title}</h1>
            <p className="hero-sub">{hero.sub}</p>
          </section>

          {/* BREADCRUMB */}
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <button onClick={goHome}>Home</button>
            <ChevRight />
            <span>Products</span>
            {category !== "All" && <><ChevRight /><span>{category}</span></>}
          </nav>

          {/* TOOLBAR */}
          <div className="toolbar" role="toolbar" aria-label="Listing controls">
            <div className="toolbar-left">
              <button
                className={`filter-toggle-btn${showSidebar ? " active" : ""}`}
                onClick={() => setShowSidebar(v => !v)}
                aria-pressed={showSidebar}
              >
                <FilterIco />
                {showSidebar ? "Hide Filters" : `Show Filters${activeFilters > 0 ? ` (${activeFilters})` : ""}`}
              </button>
              <p className="count-label">
                <strong>{filtered.length}</strong> product{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="toolbar-right">
              <label htmlFor="sort-sel" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>Sort</label>
              <select id="sort-sel" className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="view-btns" role="group" aria-label="View mode">
                <button className={`view-btn${!isListView ? " active" : ""}`} onClick={() => setIsListView(false)} aria-label="Grid view" aria-pressed={!isListView}><GridIco /></button>
                <button className={`view-btn${isListView ? " active" : ""}`} onClick={() => setIsListView(true)} aria-label="List view" aria-pressed={isListView}><ListIco /></button>
              </div>
            </div>
          </div>

          {/* MAIN */}
          <main className="main-layout" id="main-content">

            {/* SIDEBAR */}
            <aside className={`sidebar${showSidebar ? "" : " hidden"}`} aria-label="Filters" aria-hidden={!showSidebar}>
              <div className="sidebar-section">
                <div className="sidebar-header">
                  <h2 className="sidebar-heading">Filters</h2>
                  {activeFilters > 0 && <button className="clear-btn" onClick={clearFilters}>Clear ({activeFilters})</button>}
                </div>
              </div>

              {/* Category */}
              <div className="sidebar-section">
                <div className={`section-title${openSections.categories ? " open" : ""}`}
                  onClick={() => setOpenSections(p => ({ ...p, categories: !p.categories }))}
                  role="button" tabIndex={0}
                  onKeyDown={e => e.key === "Enter" && setOpenSections(p => ({ ...p, categories: !p.categories }))}>
                  Category <ChevDown />
                </div>
                {openSections.categories && (
                  <div className="filter-options">
                    {CATEGORIES.map(cat => (
                      <label key={cat} className="filter-option">
                        <input type="checkbox" checked={category === cat} onChange={() => setCategory(cat)} />
                        {cat}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="sidebar-section">
                <div className={`section-title${openSections.price ? " open" : ""}`}
                  onClick={() => setOpenSections(p => ({ ...p, price: !p.price }))}
                  role="button" tabIndex={0}>
                  Price Range <ChevDown />
                </div>
                {openSections.price && (
                  <>
                    <div className="price-slider-wrap">
                      <div className="price-fill" style={{ left: `${(minPrice / MAX_PRICE) * 100}%`, right: `${100 - (maxPrice / MAX_PRICE) * 100}%` }} />
                      <input type="range" min={0} max={MAX_PRICE} step={5} value={minPrice}
                        onChange={e => handleMinPrice(+e.target.value)} aria-label="Min price"
                        style={{ zIndex: minPrice > MAX_PRICE * 0.9 ? 5 : 3 }} />
                      <input type="range" min={0} max={MAX_PRICE} step={5} value={maxPrice}
                        onChange={e => handleMaxPrice(+e.target.value)} aria-label="Max price" style={{ zIndex: 4 }} />
                    </div>
                    <div className="price-labels">
                      <span>${minPrice}</span>
                      <span>{maxPrice >= MAX_PRICE ? "$1000+" : `$${maxPrice}`}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Rating */}
              <div className="sidebar-section">
                <div className={`section-title${openSections.rating ? " open" : ""}`}
                  onClick={() => setOpenSections(p => ({ ...p, rating: !p.rating }))}
                  role="button" tabIndex={0}>
                  Min. Rating <ChevDown />
                </div>
                {openSections.rating && (
                  <div className="filter-options">
                    {[0, 2, 3, 4].map(r => (
                      <div key={r} className={`rating-row${minRating === r ? " selected" : ""}`}
                        onClick={() => setMinRating(r)} role="button" tabIndex={0}
                        onKeyDown={e => e.key === "Enter" && setMinRating(r)}>
                        <span className="rating-stars-display">{"★".repeat(r || 5)}{"☆".repeat(r ? 5 - r : 0)}</span>
                        <span>{r === 0 ? "Any rating" : `${r}+ stars`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* PRODUCT AREA */}
            <section className="product-area" aria-label="Product listing">
              {/* Chips */}
              <div className="category-chips" role="group" aria-label="Category filter">
                {CATEGORIES.map(cat => (
                  <button key={cat} className={`chip${category === cat ? " active" : ""}`}
                    onClick={() => setCategory(cat)} aria-pressed={category === cat}>{cat}</button>
                ))}
              </div>

              {/* Loading */}
              {loading && (
                <div className="product-grid" aria-busy="true">
                  {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {/* Error */}
              {!loading && error && (
                <div className="empty-state" role="alert">
                  <div className="empty-icon">⚠️</div>
                  <h3>Something went wrong</h3>
                  <p>{error}</p>
                  <button className="add-to-cart-btn" onClick={() => window.location.reload()}>Try Again</button>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && filtered.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No products found</h3>
                  <p>Try adjusting your search or filters</p>
                  <button className="add-to-cart-btn" onClick={clearFilters}>Clear All Filters</button>
                </div>
              )}

              {/* Products */}
              {!loading && !error && paged.length > 0 && (
                <div className={`product-grid${isListView ? " list-view" : ""}`} role="list">
                  {paged.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i}
                      isListView={isListView}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      wishlisted={wishlistIds.has(product.id)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && totalPages > 1 && (
                <nav className="pagination" aria-label="Pagination">
                  <button className="page-btn" onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={safePage === 1}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`page-btn${safePage === p ? " active" : ""}`}
                      onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      aria-current={safePage === p ? "page" : undefined}>{p}</button>
                  ))}
                  <button className="page-btn" onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }} disabled={safePage === totalPages}>›</button>
                </nav>
              )}
            </section>
          </main>
        </>
      )}

      {/* ══════════ FOOTER ══════════ */}
      <footer className="plp-footer" role="contentinfo">
        <div className="footer-grid">
          <div className="footer-brand">
            <button className="logo footer-brand" onClick={goHome} style={{ background: "none", border: "none", cursor: "pointer" }}>Maison<span>.</span></button>
            <p className="footer-tagline">Curated lifestyle products for the discerning modern consumer.</p>
          </div>
          {[
            { title: "Shop",    links: ["New Arrivals", "Women", "Men", "Accessories", "Sale"] },
            { title: "Help",    links: ["FAQ", "Shipping & Returns", "Size Guide", "Contact Us"] },
            { title: "Company", links: ["About", "Careers", "Press", "Privacy Policy"] },
          ].map(col => (
            <div key={col.title} className="footer-col">
              <h4>{col.title}</h4>
              <ul>{col.links.map(l => <li key={l}><a href="#!">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2025 Maison. All rights reserved.</span>
          <span>Built with React · Powered by FakeStore API</span>
        </div>
      </footer>

      {/* ══════════ DRAWERS ══════════ */}
      {showCart && <CartDrawer items={cartItems} onClose={() => setShowCart(false)} onRemove={handleRemoveCart} onQtyChange={handleQtyChange} />}
      {showWishlist && <WishlistDrawer items={wishlist} onClose={() => setShowWishlist(false)} onRemove={handleRemoveWishlist} onAddToCart={p => { handleAddToCart(p); }} />}

      {/* ══════════ TOASTS ══════════ */}
      <ToastContainer toasts={toasts} />
    </>
  );
}