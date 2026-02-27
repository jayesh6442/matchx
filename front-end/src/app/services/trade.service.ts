import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trade } from '../models/trade.model';

@Injectable({ providedIn: 'root' })
export class TradeService {
    private readonly baseUrl = 'http://localhost:8081/api/v1/trades';

    constructor(private http: HttpClient) { }

    getTrades(symbol: string): Observable<Trade[]> {
        return this.http.get<Trade[]>(this.baseUrl, { params: { symbol } });
    }
}
