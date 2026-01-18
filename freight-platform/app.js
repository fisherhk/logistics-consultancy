// FreightView - Transactional Freight Management Platform
// Demo Application

// Sample Data
const sampleRequests = [
    {
        id: 'REQ-2024-047',
        reference: 'PO-2024-001',
        origin: { city: 'Shanghai', country: 'CN' },
        destination: { city: 'Los Angeles', country: 'US' },
        cargo: { type: 'Electronics', weight: 2500, volume: 15, value: 125000 },
        readyDate: '2026-01-25',
        deliveryDate: '2026-02-15',
        status: 'quotes_received',
        createdAt: '2026-01-20'
    },
    {
        id: 'REQ-2024-046',
        reference: 'PO-2024-002',
        origin: { city: 'Shenzhen', country: 'CN' },
        destination: { city: 'New York', country: 'US' },
        cargo: { type: 'Apparel', weight: 1800, volume: 22, value: 85000 },
        readyDate: '2026-01-28',
        deliveryDate: '2026-02-20',
        status: 'pending_quotes',
        createdAt: '2026-01-19'
    },
    {
        id: 'REQ-2024-045',
        reference: 'PO-2024-003',
        origin: { city: 'Ho Chi Minh', country: 'VN' },
        destination: { city: 'Chicago', country: 'US' },
        cargo: { type: 'General', weight: 3200, volume: 28, value: 95000 },
        readyDate: '2026-01-22',
        deliveryDate: '2026-02-28',
        status: 'decision_pending',
        createdAt: '2026-01-18'
    }
];

const sampleQuotes = {
    'REQ-2024-047': {
        air: [
            {
                forwarder: 'DHL Global Forwarding',
                logo: 'DHL',
                totalCost: 8450,
                breakdown: { freight: 7200, fuel: 650, handling: 400, docs: 200 },
                transitDays: 5,
                etd: '2026-01-27',
                eta: '2026-02-01',
                validUntil: '2026-01-30',
                carrier: 'Cathay Pacific',
                routing: 'Direct'
            },
            {
                forwarder: 'Kuehne + Nagel',
                logo: 'K+N',
                totalCost: 8780,
                breakdown: { freight: 7500, fuel: 680, handling: 380, docs: 220 },
                transitDays: 6,
                etd: '2026-01-26',
                eta: '2026-02-01',
                validUntil: '2026-01-30',
                carrier: 'Korean Air',
                routing: 'Via Seoul'
            },
            {
                forwarder: 'DB Schenker',
                logo: 'DBS',
                totalCost: 9120,
                breakdown: { freight: 7800, fuel: 720, handling: 400, docs: 200 },
                transitDays: 7,
                etd: '2026-01-26',
                eta: '2026-02-02',
                validUntil: '2026-01-30',
                carrier: 'China Airlines',
                routing: 'Via Taipei'
            }
        ],
        sea: [
            {
                forwarder: 'Kuehne + Nagel',
                logo: 'K+N',
                totalCost: 2680,
                breakdown: { freight: 2100, thc: 280, handling: 180, docs: 120 },
                transitDays: 18,
                etd: '2026-01-27',
                eta: '2026-02-14',
                validUntil: '2026-02-05',
                carrier: 'COSCO',
                routing: 'Direct',
                recommended: true
            },
            {
                forwarder: 'DHL Global Forwarding',
                logo: 'DHL',
                totalCost: 2850,
                breakdown: { freight: 2250, thc: 300, handling: 180, docs: 120 },
                transitDays: 20,
                etd: '2026-01-26',
                eta: '2026-02-15',
                validUntil: '2026-02-05',
                carrier: 'Evergreen',
                routing: 'Direct'
            },
            {
                forwarder: 'DB Schenker',
                logo: 'DBS',
                totalCost: 2920,
                breakdown: { freight: 2300, thc: 320, handling: 180, docs: 120 },
                transitDays: 22,
                etd: '2026-01-25',
                eta: '2026-02-16',
                validUntil: '2026-02-05',
                carrier: 'MSC',
                routing: 'Via Busan'
            }
        ]
    }
};

const pendingDecisions = [
    { id: 'REQ-2024-047', route: 'Shanghai → LA', savings: '$5,770', deadline: '2 days' },
    { id: 'REQ-2024-043', route: 'Taipei → Seattle', savings: '$3,240', deadline: '3 days' },
    { id: 'REQ-2024-041', route: 'Bangkok → Houston', savings: '$4,100', deadline: '5 days' }
];

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view');
const shipmentForm = document.getElementById('shipment-form');
const toast = document.getElementById('toast');
const modal = document.getElementById('quote-modal');

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = link.dataset.view;
        switchView(viewId);
    });
});

// View All links
document.querySelectorAll('.view-all').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = link.dataset.view;
        switchView(viewId);
    });
});

function switchView(viewId) {
    // Update nav
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-view="${viewId}"]`).classList.add('active');

    // Update views
    views.forEach(v => v.classList.remove('active'));
    document.getElementById(`${viewId}-view`).classList.add('active');
}

// Populate Dashboard
function populateDashboard() {
    const recentList = document.getElementById('recent-requests-list');
    recentList.innerHTML = sampleRequests.map(req => `
        <div class="request-item" data-id="${req.id}">
            <div class="request-route">
                <span class="route-from">${req.origin.city}</span>
                <span class="route-arrow">→</span>
                <span class="route-to">${req.destination.city}</span>
            </div>
            <div class="request-details">
                <span class="request-id">${req.id}</span>
                <span class="request-cargo">${req.cargo.type} • ${req.cargo.weight.toLocaleString()} kg</span>
            </div>
            <div class="request-status">
                <span class="status-badge ${req.status}">${formatStatus(req.status)}</span>
            </div>
        </div>
    `).join('');

    const decisionList = document.getElementById('pending-decisions-list');
    decisionList.innerHTML = pendingDecisions.map(dec => `
        <div class="decision-item">
            <div class="decision-info">
                <span class="decision-id">${dec.id}</span>
                <span class="decision-route">${dec.route}</span>
            </div>
            <div class="decision-savings">
                <span class="savings-amount">${dec.savings}</span>
                <span class="savings-label">potential savings</span>
            </div>
            <div class="decision-deadline">
                <span class="deadline-badge">${dec.deadline}</span>
            </div>
            <button class="btn btn-sm btn-primary" onclick="viewQuotes('${dec.id}')">Review</button>
        </div>
    `).join('');
}

function formatStatus(status) {
    const statusMap = {
        'quotes_received': 'Quotes Ready',
        'pending_quotes': 'Awaiting Quotes',
        'decision_pending': 'Decision Needed',
        'booked': 'Booked'
    };
    return statusMap[status] || status;
}

// Populate Quotes
function populateQuotes() {
    const quotes = sampleQuotes['REQ-2024-047'];

    const airCards = document.getElementById('air-quote-cards');
    airCards.innerHTML = quotes.air.map((q, i) => createQuoteCard(q, 'air', i === 0)).join('');

    const seaCards = document.getElementById('sea-quote-cards');
    seaCards.innerHTML = quotes.sea.map((q, i) => createQuoteCard(q, 'sea', q.recommended)).join('');
}

function createQuoteCard(quote, mode, isLowest = false) {
    return `
        <div class="quote-card ${isLowest ? 'recommended' : ''}" onclick="showQuoteDetails('${quote.forwarder}', '${mode}')">
            ${quote.recommended ? '<span class="rec-tag">Recommended</span>' : ''}
            ${isLowest && !quote.recommended ? '<span class="lowest-tag">Lowest Price</span>' : ''}
            <div class="quote-header">
                <div class="forwarder-info">
                    <span class="forwarder-logo-sm">${quote.logo}</span>
                    <span class="forwarder-name">${quote.forwarder}</span>
                </div>
            </div>
            <div class="quote-price">
                <span class="price-amount">$${quote.totalCost.toLocaleString()}</span>
                <span class="price-label">Total Cost</span>
            </div>
            <div class="quote-details-grid">
                <div class="quote-detail">
                    <span class="detail-icon">⏱️</span>
                    <span class="detail-value">${quote.transitDays} days</span>
                    <span class="detail-label">Transit</span>
                </div>
                <div class="quote-detail">
                    <span class="detail-icon">📅</span>
                    <span class="detail-value">${formatDate(quote.eta)}</span>
                    <span class="detail-label">ETA</span>
                </div>
                <div class="quote-detail">
                    <span class="detail-icon">${mode === 'air' ? '✈️' : '🚢'}</span>
                    <span class="detail-value">${quote.carrier}</span>
                    <span class="detail-label">Carrier</span>
                </div>
                <div class="quote-detail">
                    <span class="detail-icon">🛤️</span>
                    <span class="detail-value">${quote.routing}</span>
                    <span class="detail-label">Routing</span>
                </div>
            </div>
            <div class="quote-footer">
                <span class="valid-until">Valid until ${formatDate(quote.validUntil)}</span>
                <button class="btn btn-sm btn-outline">View Details</button>
            </div>
        </div>
    `;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Quote Details Modal
function showQuoteDetails(forwarder, mode) {
    const quotes = sampleQuotes['REQ-2024-047'][mode];
    const quote = quotes.find(q => q.forwarder === forwarder);

    const modalBody = document.getElementById('quote-modal-body');
    modalBody.innerHTML = `
        <div class="quote-detail-header">
            <div class="forwarder-logo-lg">${quote.logo}</div>
            <div>
                <h4>${quote.forwarder}</h4>
                <span class="mode-indicator ${mode}">${mode === 'air' ? '✈️ Air Freight' : '🚢 Sea Freight'}</span>
            </div>
        </div>

        <div class="quote-detail-section">
            <h5>Cost Breakdown</h5>
            <div class="breakdown-table">
                ${Object.entries(quote.breakdown).map(([key, val]) => `
                    <div class="breakdown-row">
                        <span class="breakdown-label">${formatBreakdownLabel(key)}</span>
                        <span class="breakdown-value">$${val.toLocaleString()}</span>
                    </div>
                `).join('')}
                <div class="breakdown-row total">
                    <span class="breakdown-label">Total</span>
                    <span class="breakdown-value">$${quote.totalCost.toLocaleString()}</span>
                </div>
            </div>
        </div>

        <div class="quote-detail-section">
            <h5>Schedule</h5>
            <div class="schedule-timeline">
                <div class="timeline-item">
                    <span class="timeline-date">${formatDate(quote.etd)}</span>
                    <span class="timeline-label">Departure</span>
                </div>
                <div class="timeline-line">
                    <span class="timeline-duration">${quote.transitDays} days</span>
                </div>
                <div class="timeline-item">
                    <span class="timeline-date">${formatDate(quote.eta)}</span>
                    <span class="timeline-label">Arrival</span>
                </div>
            </div>
        </div>

        <div class="quote-detail-section">
            <h5>Service Details</h5>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="label">Carrier</span>
                    <span class="value">${quote.carrier}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Routing</span>
                    <span class="value">${quote.routing}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Quote Valid Until</span>
                    <span class="value">${formatDate(quote.validUntil)}</span>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function formatBreakdownLabel(key) {
    const labels = {
        freight: 'Freight Charges',
        fuel: 'Fuel Surcharge',
        handling: 'Handling',
        docs: 'Documentation',
        thc: 'Terminal Handling'
    };
    return labels[key] || key;
}

// Modal close handlers
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Form submission
shipmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Request submitted! Quotes will be collected from selected forwarders.');
    setTimeout(() => {
        switchView('dashboard');
    }, 2000);
});

// Toggle buttons for mode filter
document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterQuotesByMode(btn.dataset.mode);
    });
});

function filterQuotesByMode(mode) {
    const airSection = document.getElementById('air-quotes');
    const seaSection = document.getElementById('sea-quotes');

    if (mode === 'all') {
        airSection.style.display = 'block';
        seaSection.style.display = 'block';
    } else if (mode === 'air') {
        airSection.style.display = 'block';
        seaSection.style.display = 'none';
    } else {
        airSection.style.display = 'none';
        seaSection.style.display = 'block';
    }
}

// View analysis button
document.getElementById('view-analysis')?.addEventListener('click', () => {
    switchView('analytics');
});

// Toast notification
function showToast(message) {
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// View quotes for a specific request
function viewQuotes(requestId) {
    switchView('quotes');
}

// Draw charts on analytics page
function drawCharts() {
    drawTradeoffChart();
    drawTrendChart();
}

function drawTradeoffChart() {
    const container = document.getElementById('tradeoff-chart');
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = 300;
    const padding = { top: 20, right: 40, bottom: 50, left: 60 };

    // Data points (transit days, cost)
    const airData = [
        { x: 5, y: 8450, label: 'DHL Air' },
        { x: 6, y: 8780, label: 'K+N Air' },
        { x: 7, y: 9120, label: 'DBS Air' }
    ];
    const seaData = [
        { x: 18, y: 2680, label: 'K+N Sea' },
        { x: 20, y: 2850, label: 'DHL Sea' },
        { x: 22, y: 2920, label: 'DBS Sea' }
    ];

    // Scales
    const xMin = 0, xMax = 25;
    const yMin = 0, yMax = 10000;

    const scaleX = (val) => padding.left + ((val - xMin) / (xMax - xMin)) * (width - padding.left - padding.right);
    const scaleY = (val) => height - padding.bottom - ((val - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom);

    // Deadline line
    const deadlineX = scaleX(21); // 21 days available

    let svg = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <!-- Grid lines -->
            <g class="grid" stroke="#e5e7eb" stroke-width="1">
                ${[0, 2500, 5000, 7500, 10000].map(y => `
                    <line x1="${padding.left}" y1="${scaleY(y)}" x2="${width - padding.right}" y2="${scaleY(y)}" />
                `).join('')}
                ${[0, 5, 10, 15, 20, 25].map(x => `
                    <line x1="${scaleX(x)}" y1="${padding.top}" x2="${scaleX(x)}" y2="${height - padding.bottom}" />
                `).join('')}
            </g>

            <!-- Deadline zone -->
            <rect x="${deadlineX}" y="${padding.top}" width="${width - padding.right - deadlineX}" height="${height - padding.top - padding.bottom}" fill="#fee2e2" opacity="0.5" />
            <line x1="${deadlineX}" y1="${padding.top}" x2="${deadlineX}" y2="${height - padding.bottom}" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,5" />
            <text x="${deadlineX + 5}" y="${padding.top + 15}" fill="#ef4444" font-size="11">Deadline</text>

            <!-- Axes -->
            <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#374151" stroke-width="2" />
            <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="#374151" stroke-width="2" />

            <!-- Axis labels -->
            <text x="${width / 2}" y="${height - 10}" text-anchor="middle" fill="#6b7280" font-size="12">Transit Time (days)</text>
            <text x="15" y="${height / 2}" text-anchor="middle" fill="#6b7280" font-size="12" transform="rotate(-90, 15, ${height / 2})">Cost (USD)</text>

            <!-- X axis ticks -->
            ${[0, 5, 10, 15, 20, 25].map(x => `
                <text x="${scaleX(x)}" y="${height - padding.bottom + 20}" text-anchor="middle" fill="#6b7280" font-size="11">${x}</text>
            `).join('')}

            <!-- Y axis ticks -->
            ${[0, 2500, 5000, 7500, 10000].map(y => `
                <text x="${padding.left - 10}" y="${scaleY(y) + 4}" text-anchor="end" fill="#6b7280" font-size="11">$${(y/1000).toFixed(1)}k</text>
            `).join('')}

            <!-- Air freight points -->
            ${airData.map(d => `
                <circle cx="${scaleX(d.x)}" cy="${scaleY(d.y)}" r="8" fill="#3b82f6" stroke="#fff" stroke-width="2" />
                <text x="${scaleX(d.x)}" y="${scaleY(d.y) - 15}" text-anchor="middle" fill="#3b82f6" font-size="10" font-weight="500">${d.label}</text>
            `).join('')}

            <!-- Sea freight points -->
            ${seaData.map(d => `
                <circle cx="${scaleX(d.x)}" cy="${scaleY(d.y)}" r="8" fill="#10b981" stroke="#fff" stroke-width="2" />
                <text x="${scaleX(d.x)}" y="${scaleY(d.y) - 15}" text-anchor="middle" fill="#10b981" font-size="10" font-weight="500">${d.label}</text>
            `).join('')}

            <!-- Recommended indicator -->
            <circle cx="${scaleX(18)}" cy="${scaleY(2680)}" r="14" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="3,2" />
        </svg>
    `;

    container.innerHTML = svg;
}

function drawTrendChart() {
    const container = document.getElementById('trend-chart');
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = 200;
    const padding = { top: 20, right: 40, bottom: 40, left: 60 };

    // 6 months of data
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    const airRates = [3.8, 3.6, 3.5, 3.4, 3.5, 3.38]; // per kg
    const seaRates = [1.1, 1.05, 0.98, 0.92, 0.95, 1.07]; // per kg (x1000 for scale)

    const xStep = (width - padding.left - padding.right) / (months.length - 1);
    const yMin = 0, yMax = 4.5;

    const scaleX = (i) => padding.left + i * xStep;
    const scaleY = (val) => height - padding.bottom - ((val - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom);

    const airPath = airRates.map((y, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(y)}`).join(' ');
    const seaPath = seaRates.map((y, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(y)}`).join(' ');

    let svg = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <!-- Grid -->
            <g class="grid" stroke="#e5e7eb" stroke-width="1">
                ${[0, 1, 2, 3, 4].map(y => `
                    <line x1="${padding.left}" y1="${scaleY(y)}" x2="${width - padding.right}" y2="${scaleY(y)}" />
                `).join('')}
            </g>

            <!-- Axes -->
            <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="#374151" stroke-width="1" />

            <!-- X axis labels -->
            ${months.map((m, i) => `
                <text x="${scaleX(i)}" y="${height - padding.bottom + 20}" text-anchor="middle" fill="#6b7280" font-size="11">${m}</text>
            `).join('')}

            <!-- Y axis labels -->
            ${[0, 1, 2, 3, 4].map(y => `
                <text x="${padding.left - 10}" y="${scaleY(y) + 4}" text-anchor="end" fill="#6b7280" font-size="11">$${y}/kg</text>
            `).join('')}

            <!-- Air line -->
            <path d="${airPath}" fill="none" stroke="#3b82f6" stroke-width="2" />
            ${airRates.map((y, i) => `
                <circle cx="${scaleX(i)}" cy="${scaleY(y)}" r="4" fill="#3b82f6" />
            `).join('')}

            <!-- Sea line -->
            <path d="${seaPath}" fill="none" stroke="#10b981" stroke-width="2" />
            ${seaRates.map((y, i) => `
                <circle cx="${scaleX(i)}" cy="${scaleY(y)}" r="4" fill="#10b981" />
            `).join('')}

            <!-- Legend -->
            <g transform="translate(${width - 150}, 10)">
                <line x1="0" y1="8" x2="20" y2="8" stroke="#3b82f6" stroke-width="2" />
                <circle cx="10" cy="8" r="3" fill="#3b82f6" />
                <text x="25" y="12" fill="#6b7280" font-size="11">Air Freight</text>

                <line x1="0" y1="28" x2="20" y2="28" stroke="#10b981" stroke-width="2" />
                <circle cx="10" cy="28" r="3" fill="#10b981" />
                <text x="25" y="32" fill="#6b7280" font-size="11">Sea Freight</text>
            </g>
        </svg>
    `;

    container.innerHTML = svg;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateDashboard();
    populateQuotes();
    drawCharts();

    // Redraw charts on window resize
    window.addEventListener('resize', drawCharts);
});
