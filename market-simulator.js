#!/usr/bin/env node
/**
 * MatchX Market Simulator
 * Bombards the matching engine with realistic volatile orders.
 * 
 * Usage: node market-simulator.js [--symbol BTC-USD] [--rate 5] [--volatility 0.003]
 * 
 * How it works:
 *  - Simulates a "mid price" that random-walks with configurable volatility
 *  - Market Makers: spray limit orders around the mid price (adds liquidity)
 *  - Market Takers: occasionally cross the spread to trigger matches (removes liquidity)
 *  - Flash events: random volatility spikes (10% chance every few seconds)
 */

const BASE_URL = 'http://localhost:8080/api/v1/orders';
const SYMBOLS = ['BTC-USD', 'ETH-USD', 'SOL-USD'];

// ── Config (override via CLI args) ─────────────────────────────
const args = process.argv.slice(2);
const get = (flag, def) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : def; };

const RATE_MS = Number(get('--rate', 150));        // ms between order bursts
const VOLATILITY = Number(get('--volatility', 0.0025)); // % std-dev per tick
const DEPTH_LEVELS = Number(get('--depth', 8));         // price levels each side
const SYMBOLS_ACTIVE = get('--symbol', null)
    ? [get('--symbol', 'BTC-USD')]
    : SYMBOLS;

// ── Realistic starting mid-prices ─────────────────────────────
const MID_PRICES = {
    'BTC-USD': 96000,
    'ETH-USD': 3400,
    'SOL-USD': 178,
    'MATIC-USD': 0.85,
    'BNB-USD': 600,
};

// ── State ──────────────────────────────────────────────────────
const state = {};
SYMBOLS_ACTIVE.forEach(sym => {
    state[sym] = {
        mid: MID_PRICES[sym] || 100,
        tickSize: MID_PRICES[sym] > 1000 ? 0.01 : MID_PRICES[sym] > 10 ? 0.001 : 0.0001,
        baseQty: MID_PRICES[sym] > 10000 ? 0.01 : MID_PRICES[sym] > 100 ? 0.1 : 1,
        orders: 0,
        trades: 0,
        lastDir: 1,
    };
});

// ── Helpers ────────────────────────────────────────────────────
const round = (n, d) => Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

function randNormal(mean = 0, std = 1) {
    // Box-Muller
    const u = 1 - Math.random();
    const v = Math.random();
    return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function jitter(base, pct) {
    return base * (1 + (Math.random() * 2 - 1) * pct);
}

async function postOrder(symbol, side, price, quantity) {
    try {
        const res = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbol, side, price, quantity }),
            signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
            state[symbol].orders++;
            return await res.json();
        }
    } catch (_) { /* network hiccup — ignore */ }
    return null;
}

// ── Price random walk ──────────────────────────────────────────
function stepPrice(sym) {
    const s = state[sym];
    // Geometric Brownian Motion-like step
    const shock = randNormal(0, VOLATILITY);
    // Occasional flash-crash / pump (1.5% chance)
    const flash = Math.random() < 0.015 ? randNormal(0, VOLATILITY * 8) : 0;
    // Slight mean-reversion toward original price (keeps price sensible)
    const origin = MID_PRICES[sym] || s.mid;
    const revert = (origin - s.mid) / origin * 0.0005;
    s.mid = s.mid * (1 + shock + flash + revert);
    s.mid = clamp(s.mid, origin * 0.3, origin * 3.5); // hard bounds
}

// ── Market Maker: sprays limit orders around mid ───────────────
async function marketMakerBurst(sym) {
    const s = state[sym];
    const spread = s.mid * 0.0004; // ~0.04% typical spread
    const levels = Math.ceil(Math.random() * DEPTH_LEVELS);

    const promises = [];
    for (let i = 1; i <= levels; i++) {
        // Bids: below mid
        const bidPx = round(s.mid - spread * i * jitter(1, 0.3), 4);
        const bidQty = round(s.baseQty * jitter(1, 0.6) * (1 / i), 6);
        if (bidPx > 0 && bidQty > 0) promises.push(postOrder(sym, 'BUY', bidPx, bidQty));

        // Asks: above mid
        const askPx = round(s.mid + spread * i * jitter(1, 0.3), 4);
        const askQty = round(s.baseQty * jitter(1, 0.6) * (1 / i), 6);
        if (askPx > 0 && askQty > 0) promises.push(postOrder(sym, 'SELL', askPx, askQty));
    }
    await Promise.allSettled(promises);
}

// ── Market Taker: crosses spread to create trades ─────────────
async function marketTakerBurst(sym) {
    const s = state[sym];
    const side = Math.random() < 0.5 ? 'BUY' : 'SELL';
    // Aggressor price intentionally crosses the spread
    const aggressiveness = jitter(1.002, 0.002); // slightly above/below mid
    const price = round(side === 'BUY'
        ? s.mid * aggressiveness
        : s.mid / aggressiveness, 4);
    const qty = round(s.baseQty * (0.5 + Math.random() * 3), 6);
    if (price > 0 && qty > 0) await postOrder(sym, side, price, qty);
}

// ── Display stats ──────────────────────────────────────────────
let tick = 0;
function printStats() {
    tick++;
    process.stdout.write('\x1B[2J\x1B[0f'); // clear terminal
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║         MatchX Market Simulator  ⚡               ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log(`  Rate: ${RATE_MS}ms | Volatility: ${(VOLATILITY * 100).toFixed(3)}% | Tick: ${tick}`);
    console.log('');
    console.log('  Symbol        Mid Price       Orders Sent');
    console.log('  ──────────    ──────────────  ───────────');
    SYMBOLS_ACTIVE.forEach(sym => {
        const s = state[sym];
        const arrow = s.lastDir > 0 ? '▲' : '▼';
        const color = s.lastDir > 0 ? '\x1b[32m' : '\x1b[31m';
        console.log(`  ${sym.padEnd(12)}  ${color}${arrow} ${String(s.mid.toFixed(4)).padStart(14)}\x1b[0m  ${s.orders}`);
    });
    console.log('');
    console.log('  Press Ctrl+C to stop');
}

// ── Main loop ──────────────────────────────────────────────────
let running = true;
process.on('SIGINT', () => {
    running = false;
    console.log('\n\nSimulator stopped.');
    SYMBOLS_ACTIVE.forEach(sym =>
        console.log(`  ${sym}: ${state[sym].orders} orders sent`));
    process.exit(0);
});

console.log(`Starting MatchX Market Simulator...`);
console.log(`Symbols: ${SYMBOLS_ACTIVE.join(', ')}`);
console.log(`Rate: order burst every ${RATE_MS}ms`);
console.log(`Connecting to ${BASE_URL}\n`);

async function loop() {
    while (running) {
        for (const sym of SYMBOLS_ACTIVE) {
            const prevMid = state[sym].mid;
            stepPrice(sym);
            state[sym].lastDir = state[sym].mid >= prevMid ? 1 : -1;

            // 80% market-making, 20% market-taking (aggressive)
            if (Math.random() < 0.80) {
                await marketMakerBurst(sym);
            } else {
                await marketTakerBurst(sym);
            }
        }

        printStats();
        await new Promise(r => setTimeout(r, RATE_MS));
    }
}

loop().catch(console.error);
