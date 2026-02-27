import {
    Component, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderBook, OrderBookEntry } from '../../models/orderbook.model';

@Component({
    selector: 'app-order-book',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="card orderbook-card">
      <div class="card-header">
        <span class="card-title">Order Book</span>
        <span class="symbol-badge">{{ book?.symbol || '—' }}</span>
      </div>

      <div class="ob-columns">
        <!-- ASKS (reversed so best ask at bottom) -->
        <div class="ob-side asks-side">
          <div class="ob-head">
            <span>Price</span><span>Qty</span>
          </div>
          <div class="ob-body asks-body">
            @for (ask of displayAsks; track ask.price) {
              <div class="ob-row ask-row">
                <div class="depth-bar ask-bar" [style.width.%]="ask.depthPct"></div>
                <span class="price red">{{ ask.price | number:'1.2-8' }}</span>
                <span class="qty">{{ ask.quantity | number:'1.4-8' }}</span>
              </div>
            }
            @if (!displayAsks.length) {
              <div class="ob-empty">No asks</div>
            }
          </div>
        </div>

        <div class="ob-divider">
          <span class="spread-label">Spread</span>
          <span class="spread-value">{{ spread }}</span>
        </div>

        <!-- BIDS -->
        <div class="ob-side bids-side">
          <div class="ob-body">
            @for (bid of displayBids; track bid.price) {
              <div class="ob-row bid-row">
                <div class="depth-bar bid-bar" [style.width.%]="bid.depthPct"></div>
                <span class="price green">{{ bid.price | number:'1.2-8' }}</span>
                <span class="qty">{{ bid.quantity | number:'1.4-8' }}</span>
              </div>
            }
            @if (!displayBids.length) {
              <div class="ob-empty">No bids</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .orderbook-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 480px;
    }
    .ob-columns {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }
    .ob-side {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .ob-head {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0.75rem;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .ob-body {
      overflow-y: auto;
      flex: 1;
    }
    .asks-body {
      display: flex;
      flex-direction: column-reverse;
    }
    .ob-row {
      position: relative;
      display: flex;
      justify-content: space-between;
      padding: 0.22rem 0.75rem;
      font-size: 0.82rem;
      font-variant-numeric: tabular-nums;
      cursor: default;
      transition: background 0.15s;
    }
    .ob-row:hover { background: rgba(255,255,255,0.04); }
    .depth-bar {
      position: absolute;
      top: 0; bottom: 0; right: 0;
      opacity: 0.1;
      transition: width 0.3s ease;
      border-radius: 2px 0 0 2px;
    }
    .ask-bar { background: var(--red); }
    .bid-bar { background: var(--green); }
    .price { font-weight: 600; }
    .qty { color: var(--text-secondary); }
    .green { color: var(--green); }
    .red { color: var(--red); }
    .ob-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.4rem 0.75rem;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      background: var(--surface-2);
    }
    .spread-label {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }
    .spread-value {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--accent);
      font-variant-numeric: tabular-nums;
    }
    .ob-empty {
      padding: 1rem 0.75rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      text-align: center;
    }
    .symbol-badge {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      background: var(--accent-dim);
      color: var(--accent);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }
  `]
})
export class OrderBookComponent implements OnChanges {
    @Input() book: OrderBook | null = null;

    displayBids: (OrderBookEntry & { depthPct: number })[] = [];
    displayAsks: (OrderBookEntry & { depthPct: number })[] = [];
    spread = '—';

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['book']) {
            this.compute();
        }
    }

    private compute(): void {
        if (!this.book) return;

        const maxDepth = 12;
        const bids = this.book.bids.slice(0, maxDepth);
        const asks = this.book.asks.slice(0, maxDepth);

        const maxBidQty = Math.max(...bids.map(b => Number(b.quantity)), 0.0001);
        const maxAskQty = Math.max(...asks.map(a => Number(a.quantity)), 0.0001);

        this.displayBids = bids.map(b => ({
            ...b,
            depthPct: (Number(b.quantity) / maxBidQty) * 100
        }));
        this.displayAsks = asks.map(a => ({
            ...a,
            depthPct: (Number(a.quantity) / maxAskQty) * 100
        }));

        const bestBid = bids[0]?.price;
        const bestAsk = asks[0]?.price;
        if (bestBid != null && bestAsk != null) {
            this.spread = (Number(bestAsk) - Number(bestBid)).toFixed(4);
        } else {
            this.spread = '—';
        }
    }
}
