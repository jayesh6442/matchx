import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { OrderBook } from '../models/orderbook.model';

@Injectable({ providedIn: 'root' })
export class OrderBookService implements OnDestroy {
    private readonly restBaseUrl = 'http://localhost:8080/api/v1/orderbook';
    private readonly wsUrl = 'http://localhost:8080/ws/orderbook';

    private stompClient: Client | null = null;
    private orderBookSubject = new Subject<OrderBook>();
    private currentSymbol: string | null = null;

    constructor(private http: HttpClient) { }

    getSnapshot(symbol: string): Observable<OrderBook> {
        return this.http.get<OrderBook>(this.restBaseUrl, { params: { symbol } });
    }

    /** Connects (or reconnects) and subscribes to live order book updates for symbol. */
    connect(symbol: string): Observable<OrderBook> {
        if (this.stompClient && this.currentSymbol === symbol) {
            return this.orderBookSubject.asObservable();
        }
        this.disconnect();
        this.currentSymbol = symbol;

        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(this.wsUrl) as WebSocket,
            reconnectDelay: 3000,
            onConnect: () => {
                this.stompClient?.subscribe(`/topic/orderbook/${symbol}`, (msg: IMessage) => {
                    const data: OrderBook = JSON.parse(msg.body);
                    this.orderBookSubject.next(data);
                });
            },
        });
        this.stompClient.activate();
        return this.orderBookSubject.asObservable();
    }

    disconnect(): void {
        if (this.stompClient?.active) {
            this.stompClient.deactivate();
        }
        this.stompClient = null;
        this.currentSymbol = null;
    }

    ngOnDestroy(): void {
        this.disconnect();
        this.orderBookSubject.complete();
    }
}
