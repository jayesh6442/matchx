import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export const SYMBOLS = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'MATIC-USD', 'BNB-USD'];

@Component({
    selector: 'app-market-ticker',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="ticker-bar">
      <div class="symbol-select-wrap">
        <label class="ticker-label">MARKET</label>
        <select class="symbol-select" [(ngModel)]="selectedSymbol" (ngModelChange)="onSymbolChange($event)">
          @for (s of symbols; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
      </div>
      <div class="ticker-stats">
        <div class="stat">
          <span class="stat-label">BIDS</span>
          <span class="stat-value green">{{ bidCount }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">ASKS</span>
          <span class="stat-value red">{{ askCount }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">SPREAD</span>
          <span class="stat-value">{{ spread }}</span>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .ticker-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .symbol-select-wrap {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .ticker-label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }
    .symbol-select {
      background: var(--surface-3);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.35rem 0.75rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      outline: none;
      transition: border-color 0.2s;
    }
    .symbol-select:focus {
      border-color: var(--accent);
    }
    .ticker-stats {
      display: flex;
      gap: 1.5rem;
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.1rem;
    }
    .stat-label {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }
    .stat-value {
      font-size: 0.9rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--text-primary);
    }
    .stat-value.green { color: var(--green); }
    .stat-value.red { color: var(--red); }
  `]
})
export class MarketTickerComponent {
    @Input() bidCount = 0;
    @Input() askCount = 0;
    @Input() spread = '—';
    @Output() symbolChanged = new EventEmitter<string>();

    symbols = SYMBOLS;
    selectedSymbol = SYMBOLS[0];

    onSymbolChange(symbol: string): void {
        this.symbolChanged.emit(symbol);
    }
}
