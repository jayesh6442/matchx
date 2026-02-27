import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { OrderRequest, OrderResponse, OrderSide } from '../../models/order.model';

type FormState = 'idle' | 'loading' | 'success' | 'error';

@Component({
    selector: 'app-order-form',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="card order-form-card">
      <div class="card-header">
        <span class="card-title">Place Order</span>
      </div>

      <!-- Side toggle -->
      <div class="side-toggle">
        <button class="side-btn" [class.active-buy]="side === 'BUY'" (click)="side = 'BUY'">
          BUY
        </button>
        <button class="side-btn" [class.active-sell]="side === 'SELL'" (click)="side = 'SELL'">
          SELL
        </button>
      </div>

      <!-- Order Form -->
      <form class="form-body" (ngSubmit)="submitOrder()">
        <div class="field">
          <label>Symbol</label>
          <input type="text" [(ngModel)]="symbol" name="symbol" placeholder="BTC-USD" readonly />
        </div>
        <div class="field">
          <label>Price (USD)</label>
          <input type="number" [(ngModel)]="price" name="price" placeholder="0.00" min="0.000001" step="any" required />
        </div>
        <div class="field">
          <label>Quantity</label>
          <input type="number" [(ngModel)]="quantity" name="quantity" placeholder="0.00" min="0.000001" step="any" required />
        </div>

        <div class="order-summary" *ngIf="price && quantity">
          <span class="summary-label">Total</span>
          <span class="summary-value">{{ price * quantity | number:'1.2-2' }} USD</span>
        </div>

        <button type="submit" class="submit-btn" [class.buy-btn]="side === 'BUY'" [class.sell-btn]="side === 'SELL'"
                [disabled]="submitState() === 'loading'">
          @if (submitState() === 'loading') {
            <span class="spinner"></span> Processing...
          } @else {
            {{ side }} {{ symbol }}
          }
        </button>
      </form>

      <!-- Toast notification -->
      @if (submitState() === 'success' && lastOrder) {
        <div class="toast toast-success">
          <span>✓ Order placed</span>
          <span class="toast-id">{{ lastOrder.id | slice:0:12 }}…</span>
        </div>
      }
      @if (submitState() === 'error') {
        <div class="toast toast-error">
          ✗ {{ errorMsg }}
        </div>
      }

      <!-- Cancel Order Section -->
      <div class="divider"></div>
      <div class="card-header">
        <span class="card-title">Cancel Order</span>
      </div>
      <div class="form-body">
        <div class="field">
          <label>Order ID</label>
          <input type="text" [(ngModel)]="cancelOrderId" name="cancelId" placeholder="Order UUID..." />
        </div>
        <button class="submit-btn cancel-btn" [disabled]="cancelState() === 'loading'"
                (click)="cancelOrder()">
          @if (cancelState() === 'loading') {
            <span class="spinner"></span> Cancelling...
          } @else {
            Cancel Order
          }
        </button>
        @if (cancelState() === 'success') {
          <div class="toast toast-success">✓ Order cancelled</div>
        }
        @if (cancelState() === 'error') {
          <div class="toast toast-error">✗ {{ cancelErrorMsg }}</div>
        }
      </div>
    </div>
  `,
    styles: [`
    .order-form-card {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
    .side-toggle {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
      margin: 0.75rem 1rem;
      background: var(--surface-3);
      border-radius: 10px;
      padding: 3px;
    }
    .side-btn {
      padding: 0.55rem;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      cursor: pointer;
      background: transparent;
      color: var(--text-muted);
      transition: all 0.2s;
    }
    .side-btn.active-buy {
      background: var(--green);
      color: #000;
      box-shadow: 0 2px 8px rgba(0,200,100,0.3);
    }
    .side-btn.active-sell {
      background: var(--red);
      color: #fff;
      box-shadow: 0 2px 8px rgba(240,80,80,0.3);
    }
    .form-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0 1rem 1rem;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .field label {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .field input {
      background: var(--surface-3);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-primary);
      padding: 0.55rem 0.75rem;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
      font-variant-numeric: tabular-nums;
    }
    .field input:focus {
      border-color: var(--accent);
    }
    .field input[readonly] {
      opacity: 0.6;
      cursor: default;
    }
    .order-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0.75rem;
      background: var(--surface-3);
      border-radius: 8px;
    }
    .summary-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .summary-value {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
    }
    .submit-btn {
      width: 100%;
      padding: 0.7rem;
      border: none;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .buy-btn {
      background: var(--green);
      color: #000;
    }
    .buy-btn:hover:not(:disabled) {
      background: #00e57a;
      box-shadow: 0 4px 12px rgba(0,200,100,0.3);
    }
    .sell-btn {
      background: var(--red);
      color: #fff;
    }
    .sell-btn:hover:not(:disabled) {
      background: #ff5a5a;
      box-shadow: 0 4px 12px rgba(240,80,80,0.3);
    }
    .cancel-btn {
      background: var(--surface-3);
      border: 1px solid var(--border);
      color: var(--text-secondary);
    }
    .cancel-btn:hover:not(:disabled) {
      border-color: var(--red);
      color: var(--red);
    }
    .divider {
      height: 1px;
      background: var(--border);
      margin: 0.5rem 0;
    }
    .toast {
      margin: 0 1rem 0.75rem;
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      animation: fadeIn 0.3s ease;
    }
    .toast-success {
      background: rgba(0,200,100,0.12);
      border: 1px solid rgba(0,200,100,0.3);
      color: var(--green);
    }
    .toast-error {
      background: rgba(240,80,80,0.12);
      border: 1px solid rgba(240,80,80,0.3);
      color: var(--red);
    }
    .toast-id {
      font-family: monospace;
      font-size: 0.78rem;
      opacity: 0.75;
    }
    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
  `]
})
export class OrderFormComponent implements OnChanges {
    @Input() symbol = 'BTC-USD';

    side: OrderSide = 'BUY';
    price: number | null = null;
    quantity: number | null = null;

    submitState = signal<FormState>('idle');
    lastOrder: OrderResponse | null = null;
    errorMsg = '';

    cancelOrderId = '';
    cancelState = signal<FormState>('idle');
    cancelErrorMsg = '';

    constructor(private orderService: OrderService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['symbol']) {
            this.reset();
        }
    }

    submitOrder(): void {
        if (!this.price || !this.quantity) return;
        this.submitState.set('loading');
        const req: OrderRequest = {
            symbol: this.symbol,
            side: this.side,
            price: this.price,
            quantity: this.quantity,
        };
        this.orderService.submitOrder(req).subscribe({
            next: (resp) => {
                this.lastOrder = resp;
                this.submitState.set('success');
                setTimeout(() => this.submitState.set('idle'), 5000);
            },
            error: (err) => {
                this.errorMsg = err?.error?.message || err?.message || 'Request failed';
                this.submitState.set('error');
                setTimeout(() => this.submitState.set('idle'), 5000);
            }
        });
    }

    cancelOrder(): void {
        if (!this.cancelOrderId.trim()) return;
        this.cancelState.set('loading');
        this.orderService.cancelOrder(this.cancelOrderId.trim(), this.symbol).subscribe({
            next: () => {
                this.cancelState.set('success');
                this.cancelOrderId = '';
                setTimeout(() => this.cancelState.set('idle'), 4000);
            },
            error: (err) => {
                this.cancelErrorMsg = err?.error?.message || 'Cancel failed';
                this.cancelState.set('error');
                setTimeout(() => this.cancelState.set('idle'), 4000);
            }
        });
    }

    private reset(): void {
        this.price = null;
        this.quantity = null;
        this.submitState.set('idle');
        this.cancelState.set('idle');
    }
}
