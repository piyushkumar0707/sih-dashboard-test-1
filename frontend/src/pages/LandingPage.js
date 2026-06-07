/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   GOOGLE FONTS INJECTION  (Barlow Condensed · Barlow · JetBrains Mono)
───────────────────────────────────────────────────────────── */
const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap';

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  (all colours via CSS vars in the style tag below)
───────────────────────────────────────────────────────────── */
const CSS = `
  /* ── fonts ── */
  @import url('${FONT_LINK}');

  /* ── tokens ── */
  :root {
    --bg:       #060a0f;
    --panel:    #0d1520;
    --border:   #1a2840;
    --text:     #c9d4e0;
    --muted:    #5d7a99;
    --amber:    #f59e0b;
    --amber-d:  #d97706;
    --green:    #22c55e;
    --blue:     #3b82f6;
    --red:      #ef4444;
    --font-head: 'Barlow Condensed', sans-serif;
    --font-body: 'Barlow', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  /* ── reset ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── base ── */
  .lp-root {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    min-height: 100vh;
  }

  /* ─── NAVBAR ─── */
  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; height: 56px;
    background: rgba(6,10,15,0.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    transition: background 0.3s;
  }
  .lp-nav-logo {
    font-family: var(--font-head);
    font-weight: 900; font-size: 22px; letter-spacing: 3px;
    color: #fff;
    display: flex; align-items: center; gap: 10px;
  }
  .lp-nav-logo-icon {
    width: 32px; height: 32px;
    border: 1px solid var(--amber);
    display: flex; align-items: center; justify-content: center;
  }
  .lp-nav-links { display: flex; gap: 32px; }
  .lp-nav-links a {
    font-family: var(--font-head);
    font-weight: 600; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--muted);
    text-decoration: none;
    transition: color 0.2s;
  }
  .lp-nav-links a:hover { color: var(--amber); }
  .lp-nav-actions { display: flex; gap: 12px; }

  /* ─── BUTTONS ─── */
  .btn-amber {
    font-family: var(--font-head); font-weight: 700;
    font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
    padding: 10px 28px;
    background: var(--amber); color: #000;
    border: 1px solid var(--amber);
    cursor: pointer; transition: background 0.2s, transform 0.15s;
  }
  .btn-amber:hover { background: var(--amber-d); border-color: var(--amber-d); transform: translateY(-1px); }

  .btn-outline {
    font-family: var(--font-head); font-weight: 700;
    font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
    padding: 10px 28px;
    background: transparent; color: var(--amber);
    border: 1px solid var(--amber);
    cursor: pointer; transition: background 0.2s, transform 0.15s;
    text-decoration: none; display: inline-block;
  }
  .btn-outline:hover { background: rgba(245,158,11,0.08); transform: translateY(-1px); }

  .btn-ghost {
    font-family: var(--font-head); font-weight: 700;
    font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
    padding: 10px 24px;
    background: transparent; color: var(--text);
    border: 1px solid var(--border);
    cursor: pointer; transition: border-color 0.2s, color 0.2s;
  }
  .btn-ghost:hover { border-color: var(--amber); color: var(--amber); }

  /* ─── HERO ─── */
  .lp-hero {
    position: relative;
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center;
    padding: 120px 24px 80px;
    overflow: hidden;
  }

  /* dot-grid background */
  .lp-hero::before {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, #1a2840 1px, transparent 1px);
    background-size: 32px 32px;
    opacity: 0.5;
    pointer-events: none;
  }
  /* faint vertical scan line */
  .lp-hero::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(180deg,
      transparent 0%, rgba(245,158,11,0.03) 50%, transparent 100%);
    pointer-events: none;
    animation: scanV 6s ease-in-out infinite;
  }
  @keyframes scanV {
    0%,100% { opacity: 0; transform: translateY(-100%); }
    50% { opacity: 1; transform: translateY(100%); }
  }

  .lp-hero-badge {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 2px;
    color: var(--amber); border: 1px solid rgba(245,158,11,0.35);
    padding: 5px 14px; margin-bottom: 32px;
    display: inline-block;
    animation: fadeUp 0.6s ease both;
  }

  .lp-hero-h1 {
    font-family: var(--font-head);
    font-weight: 900;
    font-size: clamp(56px, 9vw, 104px);
    line-height: 0.95;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #fff;
    max-width: 900px;
    animation: fadeUp 0.8s 0.15s ease both;
  }
  .lp-hero-h1 .accent { color: var(--amber); }

  .lp-hero-sub {
    font-family: var(--font-mono);
    font-size: 13px; letter-spacing: 2px;
    color: var(--muted); margin-top: 20px;
    animation: fadeUp 0.8s 0.3s ease both;
  }
  .lp-hero-sub span { color: var(--blue); }

  .lp-hero-ctas {
    display: flex; gap: 16px; margin-top: 40px; flex-wrap: wrap; justify-content: center;
    animation: fadeUp 0.8s 0.45s ease both;
  }

  .lp-hero-role-bar {
    display: flex; gap: 0; margin-top: 60px;
    border: 1px solid var(--border);
    animation: fadeUp 0.8s 0.6s ease both;
  }
  .lp-hero-role {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
    padding: 8px 24px; color: var(--muted);
    border-right: 1px solid var(--border);
  }
  .lp-hero-role:last-child { border-right: none; }
  .lp-hero-role .dot {
    display: inline-block; width: 6px; height: 6px; border-radius: 50%;
    margin-right: 7px; vertical-align: middle;
  }
  .dot-admin { background: var(--amber); }
  .dot-officer { background: var(--blue); }
  .dot-tourist { background: var(--green); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ─── STATS STRIP ─── */
  .lp-stats {
    background: var(--panel);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }
  .lp-stat {
    padding: 36px 32px;
    border-right: 1px solid var(--border);
    text-align: center;
  }
  .lp-stat:last-child { border-right: none; }
  .lp-stat-num {
    font-family: var(--font-mono); font-weight: 700;
    font-size: clamp(28px, 4vw, 48px);
    color: var(--amber); display: block; line-height: 1;
  }
  .lp-stat-label {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--muted); display: block; margin-top: 8px;
  }
  .lp-stat-num-green { color: var(--green); }

  /* ─── SECTION WRAPPER ─── */
  .lp-section {
    padding: 96px 48px;
    max-width: 1280px;
    margin: 0 auto;
  }

  .lp-section-label {
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: 3px; text-transform: uppercase;
    color: var(--amber); display: block; margin-bottom: 16px;
  }
  .lp-section-h2 {
    font-family: var(--font-head); font-weight: 900;
    font-size: clamp(36px, 5vw, 64px);
    text-transform: uppercase; color: #fff;
    line-height: 1; letter-spacing: 0.5px;
  }

  .lp-divider {
    border: none; border-top: 1px solid var(--border);
  }

  /* ─── ARCHITECTURE DIAGRAM ─── */
  .lp-arch {
    background: var(--panel);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  .lp-arch-inner {
    max-width: 1280px; margin: 0 auto;
    padding: 80px 48px;
  }
  .arch-diagram {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    margin-top: 56px;
  }
  .arch-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    width: 100%;
  }
  .arch-node {
    border: 1px solid var(--border);
    padding: 18px 24px;
    min-width: 160px;
    text-align: center;
    position: relative;
    animation: nodePulse 3s ease-in-out infinite;
  }
  .arch-node:nth-child(2) { animation-delay: 0.4s; }
  .arch-node:nth-child(3) { animation-delay: 0.8s; }
  .arch-node:nth-child(4) { animation-delay: 1.2s; }
  .arch-node:nth-child(5) { animation-delay: 1.6s; }
  .arch-node:nth-child(6) { animation-delay: 2.0s; }

  @keyframes nodePulse {
    0%, 100% { border-color: var(--border); }
    50% { border-color: rgba(245,158,11,0.4); }
  }

  .arch-node-icon {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 1.5px; color: var(--muted);
    display: block; margin-bottom: 6px;
  }
  .arch-node-name {
    font-family: var(--font-head); font-weight: 700;
    font-size: 15px; letter-spacing: 1px; text-transform: uppercase; color: #fff;
    display: block;
  }
  .arch-node-sub {
    font-family: var(--font-mono); font-size: 10px; color: var(--muted);
    display: block; margin-top: 4px;
  }
  .arch-node-react { border-color: rgba(59,130,246,0.5); }
  .arch-node-react .arch-node-name { color: var(--blue); }
  .arch-node-node { border-color: rgba(34,197,94,0.35); }
  .arch-node-node .arch-node-name { color: var(--green); }
  .arch-node-mongo { border-color: rgba(34,197,94,0.35); }
  .arch-node-mongo .arch-node-name { color: var(--green); }
  .arch-node-ai { border-color: rgba(245,158,11,0.35); }
  .arch-node-ai .arch-node-name { color: var(--amber); }
  .arch-node-chain { border-color: rgba(139,92,246,0.4); }
  .arch-node-chain .arch-node-name { color: #a78bfa; }

  .arch-connector-h {
    height: 1px; flex: 1;
    background: linear-gradient(90deg, var(--border), rgba(245,158,11,0.25), var(--border));
    position: relative;
  }
  .arch-connector-h::after {
    content: '›'; position: absolute; right: -4px; top: -9px;
    color: var(--amber); font-size: 14px; opacity: 0.5;
  }
  .arch-connector-v {
    width: 1px; height: 40px;
    background: linear-gradient(180deg, var(--border), rgba(245,158,11,0.3), var(--border));
    margin: 0 auto;
  }

  .arch-bottom-row {
    display: flex;
    gap: 24px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 40px;
  }

  /* ─── FEATURES GRID ─── */
  .lp-features-grid {
    display: grid;
    grid-template-columns: 2fr 1.4fr 1fr;
    gap: 1px;
    background: var(--border);
    margin-top: 56px;
    border: 1px solid var(--border);
  }
  .feat-cell {
    background: var(--bg);
    padding: 40px 36px;
  }
  .feat-cell-label {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase;
    color: var(--muted); display: block; margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }
  /* left: AI scoring */
  .feat-score-num {
    font-family: var(--font-mono); font-weight: 700;
    font-size: 96px; color: var(--green); line-height: 1;
    display: block;
  }
  .feat-score-risk {
    font-family: var(--font-mono); font-size: 13px; letter-spacing: 3px;
    color: var(--green); margin-top: 8px; display: block;
  }
  .feat-score-bar-wrap {
    margin-top: 20px; background: var(--border); height: 4px;
  }
  .feat-score-bar {
    height: 4px; background: var(--green);
    width: 87%; transition: width 1s ease;
  }
  .feat-score-desc {
    font-size: 14px; color: var(--muted); margin-top: 24px; line-height: 1.7;
  }
  .feat-score-details {
    margin-top: 16px; display: flex; flex-direction: column; gap: 8px;
  }
  .feat-score-row {
    display: flex; justify-content: space-between;
    font-family: var(--font-mono); font-size: 11px;
    color: var(--muted);
    padding-bottom: 6px; border-bottom: 1px solid var(--border);
  }
  .feat-score-row span:last-child { color: var(--text); }

  /* mid: blockchain log */
  .feat-terminal {
    background: #020508;
    border: 1px solid var(--border);
    padding: 16px;
    font-family: var(--font-mono); font-size: 11px;
    line-height: 1.8;
    color: var(--muted);
    margin-top: 0;
    min-height: 180px;
  }
  .terminal-line { display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px; }
  .terminal-ts { color: var(--muted); }
  .terminal-hash { color: var(--amber); word-break: break-all; }
  .terminal-event { color: var(--green); }
  .terminal-blink {
    display: inline-block; width: 7px; height: 14px;
    background: var(--green);
    animation: blink 1s step-end infinite;
    margin-left: 2px; vertical-align: text-bottom;
  }
  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }

  .feat-chain-desc { font-size: 13px; color: var(--muted); margin-top: 20px; line-height: 1.7; }
  .feat-chain-tag {
    display: inline-block; margin-top: 12px;
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 1.5px;
    text-transform: uppercase;
    border: 1px solid rgba(167,139,250,0.3);
    color: #a78bfa; padding: 4px 10px;
  }

  /* right: efir + geofence stacked */
  .feat-right-stack { display: flex; flex-direction: column; gap: 1px; height: 100%; }
  .feat-sub-cell {
    flex: 1;
    background: var(--bg);
    padding: 28px 24px;
    border-top: 1px solid var(--border);
  }
  .feat-sub-cell:first-child { border-top: none; }
  .feat-sub-title {
    font-family: var(--font-head); font-weight: 700;
    font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: #fff;
    margin-bottom: 10px;
  }
  .feat-sub-desc { font-size: 13px; color: var(--muted); line-height: 1.7; }
  .feat-sub-stat {
    font-family: var(--font-mono); font-weight: 700;
    font-size: 28px; color: var(--amber); margin-top: 12px; display: block;
  }
  .feat-sub-stat-green { color: var(--green); }

  /* ─── STATUS ALERT ROW ─── */
  .lp-alerts {
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    background: var(--panel);
    display: flex; overflow: hidden;
  }
  .alert-ticker {
    display: flex; gap: 0;
    width: 100%;
  }
  .alert-item {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 32px;
    border-right: 1px solid var(--border);
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 1.2px;
    flex: 1;
    justify-content: center;
  }
  .alert-dot {
    width: 8px; height: 8px; border-radius: 50%;
    animation: statusPulse 2s ease infinite;
    flex-shrink: 0;
  }
  .alert-dot-green { background: var(--green); }
  .alert-dot-amber { background: var(--amber); }
  .alert-dot-blue  { background: var(--blue); }
  .alert-dot-red   { background: var(--red); animation-delay: 0.5s; }
  @keyframes statusPulse {
    0%,100% { opacity: 1; box-shadow: 0 0 0 0 currentColor; }
    50% { opacity: 0.7; box-shadow: 0 0 0 4px transparent; }
  }
  .alert-label { color: var(--muted); }
  .alert-val { color: var(--text); margin-left: 4px; }

  /* ─── HOW IT WORKS ─── */
  .lp-steps {
    display: grid;
    grid-template-columns: repeat(4,1fr);
    gap: 1px;
    background: var(--border);
    margin-top: 56px;
    border: 1px solid var(--border);
  }
  .step-cell {
    background: var(--bg);
    padding: 36px 28px;
    position: relative;
  }
  .step-num {
    font-family: var(--font-mono); font-weight: 700;
    font-size: 48px; color: var(--border);
    line-height: 1; display: block; margin-bottom: 20px;
    transition: color 0.3s;
  }
  .step-cell:hover .step-num { color: rgba(245,158,11,0.25); }
  .step-title {
    font-family: var(--font-head); font-weight: 700;
    font-size: 20px; text-transform: uppercase; letter-spacing: 1px;
    color: #fff; margin-bottom: 12px;
  }
  .step-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }
  .step-tag {
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--amber);
    margin-top: 16px; display: block;
  }

  /* ─── STACK BADGES ─── */
  .lp-stack {
    border-top: 1px solid var(--border);
    padding: 24px 48px;
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    justify-content: center;
  }
  .stack-prefix {
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 2px;
    text-transform: uppercase; color: var(--muted);
  }
  .stack-badge {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 1px;
    text-transform: uppercase; color: var(--muted);
    border: 1px solid var(--border); padding: 5px 14px;
    transition: border-color 0.2s, color 0.2s;
  }
  .stack-badge:hover { border-color: var(--amber); color: var(--amber); }

  /* ─── DEMO CREDENTIALS PANEL ─── */
  .lp-demo {
    border-top: 1px solid var(--border);
    background: var(--panel);
  }
  .lp-demo-inner {
    max-width: 1280px; margin: 0 auto;
    padding: 72px 48px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .demo-heading-label {
    font-family: var(--font-mono); font-size: 11px;
    letter-spacing: 3px; text-transform: uppercase;
    color: var(--amber); display: block; margin-bottom: 14px;
  }
  .demo-heading {
    font-family: var(--font-head); font-weight: 900;
    font-size: 48px; text-transform: uppercase;
    color: #fff; line-height: 1; letter-spacing: 0.5px;
    margin-bottom: 12px;
  }
  .demo-sub {
    font-size: 14px; color: var(--muted); line-height: 1.7;
    max-width: 380px;
  }
  .demo-cta-wrap { margin-top: 28px; display: flex; gap: 12px; align-items: center; }
  .demo-cards { display: flex; flex-direction: column; gap: 1px; }
  .demo-card {
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 20px 24px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 20px;
    transition: border-color 0.2s;
    position: relative;
  }
  .demo-card + .demo-card { border-top: none; }
  .demo-card:hover { border-color: rgba(245,158,11,0.4); }
  .demo-role-badge {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 2px; text-transform: uppercase;
    padding: 5px 12px;
    border: 1px solid var(--border);
    min-width: 90px; text-align: center;
  }
  .demo-role-admin   { color: var(--amber); border-color: rgba(245,158,11,0.35); }
  .demo-role-officer { color: var(--blue);  border-color: rgba(59,130,246,0.35); }
  .demo-role-tourist { color: var(--green); border-color: rgba(34,197,94,0.35); }
  .demo-creds {
    display: flex; flex-direction: column; gap: 4px;
  }
  .demo-cred-row {
    display: flex; align-items: center; gap: 10px;
  }
  .demo-cred-label {
    font-family: var(--font-mono); font-size: 9px;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--muted); min-width: 32px;
  }
  .demo-cred-val {
    font-family: var(--font-mono); font-size: 13px;
    color: var(--text); letter-spacing: 0.5px;
  }
  .demo-copy-btn {
    font-family: var(--font-mono); font-size: 10px;
    letter-spacing: 1.5px; text-transform: uppercase;
    background: none; border: 1px solid var(--border);
    color: var(--muted); padding: 6px 12px;
    cursor: pointer; transition: border-color 0.2s, color 0.2s;
    white-space: nowrap;
  }
  .demo-copy-btn:hover { border-color: var(--amber); color: var(--amber); }
  .demo-copy-btn.copied { border-color: var(--green); color: var(--green); }
  .demo-access-note {
    font-family: var(--font-mono); font-size: 10px;
    color: var(--muted); letter-spacing: 1px;
    margin-top: 16px; padding-top: 16px;
    border-top: 1px solid var(--border);
  }
  .demo-access-note span { color: var(--amber); }

  @media (max-width: 900px) {
    .lp-demo-inner { grid-template-columns: 1fr; gap: 40px; padding: 56px 20px; }
    .demo-heading { font-size: 36px; }
  }

  /* ─── FOOTER ─── */
  .lp-footer {
    background: var(--panel);
    border-top: 1px solid var(--border);
    padding: 40px 48px;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 20px;
  }
  .footer-logo {
    font-family: var(--font-head); font-weight: 900;
    font-size: 20px; letter-spacing: 4px; color: #fff;
    text-transform: uppercase;
  }
  .footer-meta {
    font-family: var(--font-mono); font-size: 11px; color: var(--muted);
    text-align: center;
  }
  .footer-meta span { color: var(--amber); }
  .footer-links { display: flex; gap: 24px; }
  .footer-link {
    font-family: var(--font-mono); font-size: 11px; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--muted);
    text-decoration: none; transition: color 0.2s;
  }
  .footer-link:hover { color: var(--amber); }

  /* ─── SCROLL ANIMATIONS ─── */
  .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .reveal.visible { opacity: 1; transform: translateY(0); }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 900px) {
    .lp-nav { padding: 0 20px; }
    .lp-nav-links { display: none; }
    .lp-stats { grid-template-columns: repeat(2,1fr); }
    .lp-stat { border-bottom: 1px solid var(--border); }
    .lp-section { padding: 64px 20px; }
    .lp-features-grid { grid-template-columns: 1fr; }
    .arch-bottom-row { flex-direction: column; align-items: center; }
    .lp-steps { grid-template-columns: repeat(2,1fr); }
    .lp-footer { flex-direction: column; align-items: flex-start; }
    .lp-stack { padding: 24px 20px; }
    .lp-arch-inner { padding: 64px 20px; }
    .lp-alerts { flex-direction: column; }
    .alert-item { border-right: none; border-bottom: 1px solid var(--border); }
  }
  @media (max-width: 600px) {
    .lp-steps { grid-template-columns: 1fr; }
    .lp-stats { grid-template-columns: repeat(2,1fr); }
  }
`;

/* ─────────────────────────────────────────────────────────────
   ANIMATED COUNTER HOOK
───────────────────────────────────────────────────────────── */
function useCounter(target, duration = 2200, decimals = 0) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const ran = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !ran.current) {
          ran.current = true;
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setVal(parseFloat((eased * target).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration, decimals]);

  return [val, ref];
}

/* ─────────────────────────────────────────────────────────────
   STAT ITEM
───────────────────────────────────────────────────────────── */
function StatItem({ prefix = '', value, suffix = '', label, green }) {
  const [count, ref] = useCounter(value, 2400, value % 1 !== 0 ? 1 : 0);
  const display = value % 1 !== 0
    ? count.toFixed(1)
    : count.toLocaleString();
  return (
    <div className="lp-stat" ref={ref}>
      <span className={`lp-stat-num${green ? ' lp-stat-num-green' : ''}`}>
        {prefix}{display}{suffix}
      </span>
      <span className="lp-stat-label">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   REVEAL HOOK
───────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─────────────────────────────────────────────────────────────
   BLOCKCHAIN TERMINAL  (lines type in on scroll)
───────────────────────────────────────────────────────────── */
const LOGS = [
  {
    ts: '2025-12-07T14:32:07Z',
    hash: '0x9f2a7c4e1b83f6d2a9e0c5f7b21d8a46c38e9f1a',
    event: 'INCIDENT_LOGGED · SOS_TRIGGER',
  },
  {
    ts: '2025-12-07T14:35:51Z',
    hash: '0x3d8e2a1f9b74c6e5a0d2f8b14c9e7a23f61b8d4c',
    event: 'E-FIR_GENERATED · AUTO',
  },
  {
    ts: '2025-12-07T15:01:22Z',
    hash: '0xb4f9c7a2e15d3b68a0f2c9e4d71a8b35e6c92f7a',
    event: 'GEOFENCE_BREACH · ZONE_3',
  },
];

function BlockchainTerminal() {
  const [visible, setVisible] = useState(0);
  const ref = useRef(null);
  const ran = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !ran.current) {
          ran.current = true;
          LOGS.forEach((_, i) => {
            setTimeout(() => setVisible(i + 1), i * 700 + 200);
          });
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="feat-terminal">
      {LOGS.slice(0, visible).map((log, i) => (
        <div className="terminal-line" key={i}>
          <span className="terminal-ts">$ [{log.ts}]</span>
          <span className="terminal-hash">  keccak256 → {log.hash}</span>
          <span className="terminal-event">  EVENT: {log.event}</span>
        </div>
      ))}
      {visible < LOGS.length
        ? null
        : <span className="terminal-blink" />
      }
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DEMO CREDENTIALS PANEL
───────────────────────────────────────────────────────────── */
const DEMO_ACCOUNTS = [
  {
    role: 'ADMIN',
    roleClass: 'demo-role-admin',
    username: 'admin',
    password: 'admin123',
    desc: 'Full system control — user mgmt, analytics, blockchain logs',
  },
  {
    role: 'OFFICER',
    roleClass: 'demo-role-officer',
    username: 'officer1',
    password: 'officer123',
    desc: 'Field ops — GPS monitoring, geo-fencing, incident response',
  },
  {
    role: 'TOURIST',
    roleClass: 'demo-role-tourist',
    username: 'tourist1',
    password: 'tourist123',
    desc: 'Personal safety dashboard — live score, SOS, location sharing',
  },
];

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      className={`demo-copy-btn${copied ? ' copied' : ''}`}
      onClick={handleCopy}
    >
      {copied ? '✓ COPIED' : 'COPY'}
    </button>
  );
}

function DemoPanel({ onLogin }) {
  const ref = useReveal();
  return (
    <section className="lp-demo" id="demo">
      <div className="lp-demo-inner reveal" ref={ref}>
        {/* Left: heading + CTA */}
        <div>
          <span className="demo-heading-label">// demo access</span>
          <div className="demo-heading">TRY IT<br />RIGHT NOW.</div>
          <p className="demo-sub">
            Three role-based accounts are pre-seeded on the live platform.
            Click into any role to experience the full command interface —
            no sign-up required.
          </p>
          <div className="demo-cta-wrap">
            <button className="btn-amber" onClick={onLogin}>
              ▸ ENTER DASHBOARD
            </button>
            <a
              href="https://travira-iota.vercel.app/"
              target="_blank" rel="noreferrer"
              className="btn-outline"
            >
              LIVE DEMO ↗
            </a>
          </div>
          <p className="demo-access-note">
            <span>NOTE:</span> Demo data resets every 24h. Blockchain logs
            are on Polygon Amoy testnet — transactions are real but valueless.
          </p>
        </div>

        {/* Right: credential cards */}
        <div className="demo-cards">
          {DEMO_ACCOUNTS.map((acc) => (
            <div className="demo-card" key={acc.role}>
              <span className={`demo-role-badge ${acc.roleClass}`}>
                {acc.role}
              </span>
              <div className="demo-creds">
                <div className="demo-cred-row">
                  <span className="demo-cred-label">USER</span>
                  <span className="demo-cred-val">{acc.username}</span>
                </div>
                <div className="demo-cred-row">
                  <span className="demo-cred-label">PASS</span>
                  <span className="demo-cred-val">{acc.password}</span>
                </div>
                <div className="demo-cred-row" style={{ marginTop: 4 }}>
                  <span className="demo-cred-label" style={{ fontSize: 9, color: 'var(--muted)' }}></span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 0.5 }}>
                    {acc.desc}
                  </span>
                </div>
              </div>
              <CopyBtn text={`${acc.username} / ${acc.password}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function LandingPage({ onLogin }) {
  const archRef = useReveal();
  const featRef = useReveal();
  const stepsRef = useReveal();

  return (
    <>
      {/* Inject CSS */}
      <style>{CSS}</style>

      <div className="lp-root">

        {/* ── NAVBAR ── */}
        <nav className="lp-nav">
          <div className="lp-nav-logo">
            <div className="lp-nav-logo-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            TRAVIRA
          </div>

          <div className="lp-nav-links">
            <a href="#architecture">Architecture</a>
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
          </div>

          <div className="lp-nav-actions">
            <a
              href="https://github.com/piyushkumar0707/sih-dashboard-test-1"
              target="_blank" rel="noreferrer"
              className="btn-ghost"
            >
              GitHub
            </a>
            <button onClick={onLogin} className="btn-amber">
              Enter Platform
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-hero">
          <div className="lp-hero-badge">
            ▸ SMART INDIA HACKATHON · AI-POWERED SAFETY PLATFORM
          </div>

          <h1 className="lp-hero-h1">
            TOURIST SAFETY.<br />
            <span className="accent">REAL-TIME.</span><br />
            SECURED.
          </h1>

          <p className="lp-hero-sub">
            <span>AI</span> · BLOCKCHAIN · GPS TRACKING · E-FIR · GEO-FENCING
          </p>

          <div className="lp-hero-ctas">
            <a
              href="https://travira-iota.vercel.app/"
              target="_blank" rel="noreferrer"
              className="btn-amber"
            >
              ▸ VIEW LIVE DEMO
            </a>
            <a
              href="https://github.com/piyushkumar0707/sih-dashboard-test-1"
              target="_blank" rel="noreferrer"
              className="btn-outline"
            >
              GitHub Repository
            </a>
            <button onClick={onLogin} className="btn-ghost">
              Dashboard Login
            </button>
          </div>

          <div className="lp-hero-role-bar">
            <div className="lp-hero-role">
              <span className="dot dot-admin" />ADMIN
            </div>
            <div className="lp-hero-role">
              <span className="dot dot-officer" />OFFICER
            </div>
            <div className="lp-hero-role">
              <span className="dot dot-tourist" />TOURIST
            </div>
          </div>
        </section>

        {/* ── LIVE STATS STRIP ── */}
        <div className="lp-stats">
          <StatItem value={2847} label="TOURISTS MONITORED" />
          <StatItem value={99.2} suffix="%" label="SAFETY SCORE AVG" green />
          <StatItem prefix="< " value={3} suffix="s" label="INCIDENT DETECTION" />
          <StatItem value={5} label="MICROSERVICES" />
        </div>

        {/* ── STATUS BAR ── */}
        <div className="lp-alerts">
          <div className="alert-ticker">
            {[
              { dot: 'green', label: 'NODE.JS API', val: 'ONLINE' },
              { dot: 'green', label: 'AI SCORING SVC', val: 'ACTIVE' },
              { dot: 'amber', label: 'BLOCKCHAIN', val: 'SYNCING' },
              { dot: 'blue',  label: 'GPS STREAM', val: 'LIVE' },
              { dot: 'green', label: 'MONGODB', val: 'CONNECTED' },
              { dot: 'amber', label: 'ACTIVE INCIDENTS', val: '03' },
            ].map((a, i) => (
              <div className="alert-item" key={i} style={{ borderRight: i < 5 ? '1px solid var(--border)' : 'none' }}>
                <span className={`alert-dot alert-dot-${a.dot}`} />
                <span className="alert-label">{a.label}</span>
                <span className="alert-val">{a.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── ARCHITECTURE DIAGRAM ── */}
        <section className="lp-arch" id="architecture">
          <div className="lp-arch-inner">
            <span className="lp-section-label">// system architecture</span>
            <h2 className="lp-section-h2">5 MICROSERVICES,<br />ONE COMMAND SYSTEM</h2>

            <div className="arch-diagram" ref={archRef} style={{ opacity: 1 }}>
              {/* Row 1: React Frontend */}
              <div className="arch-row">
                <div className="arch-node arch-node-react">
                  <span className="arch-node-icon">LAYER 01 · FRONTEND</span>
                  <span className="arch-node-name">React PWA</span>
                  <span className="arch-node-sub">Leaflet Maps · Socket.io</span>
                </div>
              </div>

              {/* Connector down */}
              <div className="arch-connector-v" />

              {/* Row 2: Node.js API */}
              <div className="arch-row">
                <div className="arch-node arch-node-node" style={{ minWidth: 220 }}>
                  <span className="arch-node-icon">LAYER 02 · BACKEND</span>
                  <span className="arch-node-name">Node.js API Gateway</span>
                  <span className="arch-node-sub">Express · JWT · WebSocket</span>
                </div>
              </div>

              {/* Connector down */}
              <div className="arch-connector-v" />

              {/* Row 3: Data + AI + Chain */}
              <div className="arch-row" style={{ gap: 24, flexWrap: 'wrap' }}>
                <div className="arch-node arch-node-mongo">
                  <span className="arch-node-icon">LAYER 03 · DATA</span>
                  <span className="arch-node-name">MongoDB Atlas</span>
                  <span className="arch-node-sub">2dsphere · GridFS</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="arch-node arch-node-ai">
                    <span className="arch-node-icon">LAYER 03 · AI #1</span>
                    <span className="arch-node-name">Safety Score API</span>
                    <span className="arch-node-sub">FastAPI · Random Forest ML</span>
                  </div>
                  <div className="arch-node arch-node-ai">
                    <span className="arch-node-icon">LAYER 03 · AI #2</span>
                    <span className="arch-node-name">Case Report API</span>
                    <span className="arch-node-sub">FastAPI · E-FIR Generation</span>
                  </div>
                </div>

                <div className="arch-node arch-node-chain">
                  <span className="arch-node-icon">LAYER 03 · CHAIN</span>
                  <span className="arch-node-name">Polygon Amoy</span>
                  <span className="arch-node-sub">Solidity · Hardhat · keccak256</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES SECTION ── */}
        <section id="features">
          <div className="lp-section">
            <span className="lp-section-label">// core capabilities</span>
            <h2 className="lp-section-h2">INTELLIGENCE<br />AT EVERY LAYER</h2>
          </div>

          <div className="lp-features-grid reveal" ref={featRef}>
            {/* LEFT: AI Scoring */}
            <div className="feat-cell">
              <span className="feat-cell-label">// AI SAFETY SCORING · RANDOM FOREST ML</span>
              <span className="feat-score-num">87.4</span>
              <span className="feat-score-risk">▲ RISK: LOW · TOURIST_ID: TRV-2291</span>
              <div className="feat-score-bar-wrap">
                <div className="feat-score-bar" />
              </div>
              <p className="feat-score-desc">
                A Python FastAPI microservice runs a trained Random Forest classifier
                against live GPS data, time-of-day, crowd density, and historical
                incident patterns — recalculating each tourist's risk score every 30 seconds.
              </p>
              <div className="feat-score-details">
                <div className="feat-score-row">
                  <span>ALGORITHM</span><span>Random Forest (sklearn)</span>
                </div>
                <div className="feat-score-row">
                  <span>REFRESH RATE</span><span>30s continuous</span>
                </div>
                <div className="feat-score-row">
                  <span>FEATURES</span><span>GPS · Time · Density · History</span>
                </div>
                <div className="feat-score-row">
                  <span>ANOMALY DETECT</span><span>Isolation Forest</span>
                </div>
                <div className="feat-score-row">
                  <span>GEOSPATIAL IDX</span><span>MongoDB 2dsphere</span>
                </div>
              </div>
            </div>

            {/* MIDDLE: Blockchain Logs */}
            <div className="feat-cell">
              <span className="feat-cell-label">// IMMUTABLE INCIDENT TRAIL</span>
              <BlockchainTerminal />
              <p className="feat-chain-desc">
                Every SOS trigger, geofence breach, and E-FIR is hashed with
                keccak256 and committed to the Polygon Amoy testnet via
                Solidity smart contracts deployed through Hardhat. Zero
                tampering, full auditability.
              </p>
              <span className="feat-chain-tag">POLYGON AMOY TESTNET</span>
              <span className="feat-chain-tag" style={{ marginLeft: 8 }}>SOLIDITY + HARDHAT</span>
            </div>

            {/* RIGHT: E-FIR + Geofence */}
            <div className="feat-cell" style={{ padding: 0 }}>
              <div className="feat-right-stack">
                <div className="feat-sub-cell" style={{ borderTop: 'none' }}>
                  <span className="feat-cell-label" style={{ fontSize: 9 }}>// AUTOMATED E-FIR</span>
                  <div className="feat-sub-title">AUTO INCIDENT RESPONSE</div>
                  <p className="feat-sub-desc">
                    Anomaly detection triggers instant E-FIR creation — AI
                    compiles location, timestamp, evidence, and tourist profile.
                    Zero manual entry needed.
                  </p>
                  <span className="feat-sub-stat">&lt; 3s</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 1.5 }}>
                    REPORT GENERATION
                  </span>
                </div>
                <div className="feat-sub-cell">
                  <span className="feat-cell-label" style={{ fontSize: 9 }}>// GPS + GEOFENCING</span>
                  <div className="feat-sub-title">REAL-TIME GEO ALERTS</div>
                  <p className="feat-sub-desc">
                    Officers define geo-fence zones on Leaflet Maps.
                    MongoDB 2dsphere proximity queries fire WebSocket
                    alerts on breach in under 1 second.
                  </p>
                  <span className="feat-sub-stat feat-sub-stat-green">LIVE</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 1.5 }}>
                    GPS TRACKING STREAM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WORKFLOW ── */}
        <section id="workflow" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="lp-section">
            <span className="lp-section-label">// operational workflow</span>
            <h2 className="lp-section-h2">FOUR STEPS.<br />ZERO GAPS.</h2>

            <div className="lp-steps reveal" ref={stepsRef}>
              {[
                {
                  n: '01', title: 'REGISTER & ONBOARD',
                  desc: 'Tourists register via PWA. Admins approve officer accounts via automated role-based provisioning workflow.',
                  tag: 'RBAC · JWT Auth',
                },
                {
                  n: '02', title: 'LIVE MONITORING',
                  desc: 'Officers track GPS locations, AI safety scores, and geo-fence status on a real-time dashboard with WebSocket feeds.',
                  tag: 'Socket.io · Leaflet',
                },
                {
                  n: '03', title: 'INCIDENT RESPONSE',
                  desc: 'Alert triggers AI E-FIR generation, authority notification, and evidence compilation — all automated, under 3 seconds.',
                  tag: 'FastAPI · Python ML',
                },
                {
                  n: '04', title: 'SECURE AUDIT',
                  desc: 'Every action is immutably committed to the blockchain — keccak256 hashed, Polygon Amoy logged. Full accountability.',
                  tag: 'Solidity · Polygon',
                },
              ].map((s) => (
                <div className="step-cell" key={s.n}>
                  <span className="step-num">{s.n}</span>
                  <div className="step-title">{s.title}</div>
                  <p className="step-desc">{s.desc}</p>
                  <span className="step-tag">▸ {s.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STACK BADGES ── */}
        <div className="lp-stack">
          <span className="stack-prefix">STACK:</span>
          {[
            'React', 'Node.js', 'Python FastAPI',
            'MongoDB', 'Blockchain (Polygon)', 'Random Forest',
            'Leaflet Maps', 'Socket.io', 'Hardhat', 'Solidity',
          ].map((b) => (
            <span className="stack-badge" key={b}>{b}</span>
          ))}
        </div>

        {/* ── DEMO ACCESS PANEL ── */}
        <DemoPanel onLogin={onLogin} />

        {/* ── FOOTER ── */}
        <footer className="lp-footer">
          <div className="footer-logo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" style={{ marginRight: 8, verticalAlign: 'middle' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            TRAVIRA
          </div>

          <div className="footer-meta">
            <span>SMART INDIA HACKATHON 2025</span> · AI Tourism Safety Platform<br />
            <span>v1.0.0</span> · 5 Microservices · Polygon Amoy · MongoDB Atlas
          </div>

          <div className="footer-links">
            <a
              href="https://travira-iota.vercel.app/"
              target="_blank" rel="noreferrer"
              className="footer-link"
            >
              ↗ LIVE DEMO
            </a>
            <a
              href="https://github.com/piyushkumar0707/sih-dashboard-test-1"
              target="_blank" rel="noreferrer"
              className="footer-link"
            >
              ↗ GITHUB
            </a>
            <button
              onClick={onLogin}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              className="footer-link"
            >
              ↗ DASHBOARD
            </button>
          </div>
        </footer>

      </div>
    </>
  );
}
