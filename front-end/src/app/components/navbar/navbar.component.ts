import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-navbar',
    standalone: true,
    template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="logo-icon">⚡</span>
        <span class="brand-name">Match<span class="brand-accent">X</span></span>
      </div>
      <div class="navbar-meta">
        <span class="status-dot"></span>
        <span class="status-label">Live</span>
        <span class="nav-clock">{{ currentTime }}</span>
      </div>
    </nav>
  `,
    styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      height: 56px;
      background: var(--surface-1);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .logo-icon {
      font-size: 1.4rem;
    }
    .brand-name {
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--text-primary);
    }
    .brand-accent {
      color: var(--accent);
    }
    .navbar-meta {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 6px var(--green);
      animation: pulse 2s infinite;
    }
    .status-label {
      color: var(--green);
      font-weight: 600;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .nav-clock {
      font-variant-numeric: tabular-nums;
      color: var(--text-muted);
      font-size: 0.82rem;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
    currentTime = '';
    private timer: ReturnType<typeof setInterval> | null = null;

    ngOnInit(): void {
        this.updateTime();
        this.timer = setInterval(() => this.updateTime(), 1000);
    }

    ngOnDestroy(): void {
        if (this.timer) clearInterval(this.timer);
    }

    private updateTime(): void {
        this.currentTime = new Date().toLocaleTimeString('en-US', {
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
}
