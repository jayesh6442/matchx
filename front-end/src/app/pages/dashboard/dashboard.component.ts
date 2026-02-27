import {
    Component, OnInit, OnDestroy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { MarketTickerComponent } from '../../components/market-ticker/market-ticker.component';
import { OrderBookComponent } from '../../components/order-book/order-book.component';
import { OrderFormComponent } from '../../components/order-form/order-form.component';
import { TradeFeedComponent } from '../../components/trade-feed/trade-feed.component';

import { OrderBookService } from '../../services/orderbook.service';
import { OrderBook } from '../../models/orderbook.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        NavbarComponent,
        MarketTickerComponent,
        OrderBookComponent,
        OrderFormComponent,
        TradeFeedComponent,
    ],
    template: `
    <div class="dashboard-shell">
      <app-navbar />

      <app-market-ticker
        [bidCount]="orderBook()?.bids?.length ?? 0"
        [askCount]="orderBook()?.asks?.length ?? 0"
        [spread]="spread()"
        (symbolChanged)="onSymbolChange($event)"
      />

      <div class="dashboard-grid">
        <app-order-book [book]="orderBook()" />
        <app-order-form [symbol]="symbol()" />
        <app-trade-feed [symbol]="symbol()" />
      </div>

      <!-- WS connection status ribbon -->
      @if (wsError()) {
        <div class="ws-error-bar">
          ⚠ WebSocket disconnected — showing REST snapshot only
        </div>
      }
    </div>
  `,
    styles: [`
    .dashboard-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--bg);
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: 320px 340px 1fr;
      gap: 1rem;
      padding: 1rem;
      flex: 1;
      align-items: start;
    }
    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 640px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
    .ws-error-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.5rem 1.25rem;
      background: rgba(240, 80, 80, 0.12);
      border-top: 1px solid rgba(240, 80, 80, 0.3);
      color: var(--red);
      font-size: 0.82rem;
      font-weight: 600;
      text-align: center;
      z-index: 200;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
    symbol = signal('BTC-USD');
    orderBook = signal<OrderBook | null>(null);
    spread = signal('—');
    wsError = signal(false);

    private wsSub: Subscription | null = null;

    constructor(private obService: OrderBookService) { }

    ngOnInit(): void {
        this.loadSymbol(this.symbol());
    }

    ngOnDestroy(): void {
        this.wsSub?.unsubscribe();
        this.obService.disconnect();
    }

    onSymbolChange(sym: string): void {
        this.symbol.set(sym);
        this.orderBook.set(null);
        this.loadSymbol(sym);
    }

    private loadSymbol(sym: string): void {
        // Load initial snapshot via REST
        this.obService.getSnapshot(sym).subscribe({
            next: (ob) => {
                this.orderBook.set(ob);
                this.computeSpread(ob);
            },
            error: () => { }
        });

        // Subscribe to live WS updates
        this.wsSub?.unsubscribe();
        this.wsError.set(false);
        this.wsSub = this.obService.connect(sym).subscribe({
            next: (ob) => {
                this.orderBook.set(ob);
                this.computeSpread(ob);
                this.wsError.set(false);
            },
            error: () => this.wsError.set(true)
        });
    }

    private computeSpread(ob: OrderBook): void {
        const bestBid = ob.bids?.[0]?.price;
        const bestAsk = ob.asks?.[0]?.price;
        if (bestBid != null && bestAsk != null) {
            this.spread.set((Number(bestAsk) - Number(bestBid)).toFixed(4));
        } else {
            this.spread.set('—');
        }
    }
}
