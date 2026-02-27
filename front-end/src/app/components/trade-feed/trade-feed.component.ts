import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TradeService } from '../../services/trade.service';
import { Trade } from '../../models/trade.model';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-trade-feed',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="card trade-feed-card">
      <div class="card-header">
        <span class="card-title">Recent Trades</span>
        <span class="refresh-badge">Auto-refresh 3s</span>
      </div>
      <div class="tf-head">
        <span>Price</span>
        <span>Qty</span>
        <span>Time</span>
      </div>
      <div class="tf-body">
        @for (trade of trades; track trade.id) {
          <div class="tf-row" [class.new-row]="newIds.has(trade.id!)">
            <span class="price accent">{{ trade.price | number:'1.2-8' }}</span>
            <span class="qty">{{ trade.quantity | number:'1.4-8' }}</span>
            <span class="time">{{ formatTime(trade.timestamp) }}</span>
          </div>
        }
        @if (!trades.length && !loading) {
          <div class="tf-empty">
            <span>No trades yet</span>
            <span class="tf-empty-sub">Place matching orders to see trades</span>
          </div>
        }
        @if (loading && !trades.length) {
          <div class="tf-empty">Loading…</div>
        }
      </div>
    </div>
  `,
    styles: [`
    .trade-feed-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 480px;
    }
    .refresh-badge {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      background: var(--surface-3);
      padding: 0.2rem 0.5rem;
      border-radius: 20px;
    }
    .tf-head {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      padding: 0.3rem 0.75rem;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
      border-bottom: 1px solid var(--border);
    }
    .tf-body {
      overflow-y: auto;
      flex: 1;
    }
    .tf-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      padding: 0.28rem 0.75rem;
      font-size: 0.82rem;
      font-variant-numeric: tabular-nums;
      transition: background 0.2s;
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }
    .tf-row:hover {
      background: rgba(255,255,255,0.04);
    }
    .new-row {
      animation: flashRow 0.8s ease;
    }
    @keyframes flashRow {
      0% { background: rgba(99, 102, 241, 0.18); }
      100% { background: transparent; }
    }
    .price { font-weight: 600; }
    .accent { color: var(--accent); }
    .qty { color: var(--text-secondary); }
    .time { color: var(--text-muted); font-size: 0.75rem; }
    .tf-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 3rem 1rem;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .tf-empty-sub {
      font-size: 0.75rem;
      opacity: 0.6;
    }
  `]
})
export class TradeFeedComponent implements OnChanges, OnDestroy {
    @Input() symbol = 'BTC-USD';

    trades: Trade[] = [];
    newIds = new Set<number>();
    loading = false;
    private sub: Subscription | null = null;

    constructor(private tradeService: TradeService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['symbol']) {
            this.restart();
        }
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    private restart(): void {
        this.sub?.unsubscribe();
        this.trades = [];
        this.loading = true;

        this.sub = interval(3000).pipe(
            switchMap(() => this.tradeService.getTrades(this.symbol))
        ).subscribe({
            next: (incoming) => {
                this.loading = false;
                const existingIds = new Set(this.trades.map(t => t.id));
                this.newIds.clear();
                incoming.forEach(t => {
                    if (t.id && !existingIds.has(t.id)) this.newIds.add(t.id!);
                });
                this.trades = incoming.slice(0, 50).reverse();
            },
            error: () => { this.loading = false; }
        });

        // Immediate first fetch
        this.tradeService.getTrades(this.symbol).subscribe({
            next: (res) => {
                this.loading = false;
                this.trades = res.slice(0, 50).reverse();
            },
            error: () => { this.loading = false; }
        });
    }

    formatTime(ts: string): string {
        if (!ts) return '—';
        try {
            return new Date(ts).toLocaleTimeString('en-US', {
                hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        } catch { return '—'; }
    }
}
