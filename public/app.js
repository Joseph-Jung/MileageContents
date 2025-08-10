let mileageDeals = [];
let filteredDeals = [];
let isLoading = false;
let dataSource = 'unknown';

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatMiles(miles) {
    return new Intl.NumberFormat('en-US').format(miles);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

function getAvailabilityColor(availability) {
    switch(availability.toLowerCase()) {
        case 'excellent': return '#28a745';
        case 'good': return '#ffc107';
        case 'limited': return '#dc3545';
        default: return '#6c757d';
    }
}

function createDealCard(deal) {
    const dataSourceBadge = deal.isLiveData 
        ? '<div class="data-source-badge live">🔴 LIVE</div>' 
        : '<div class="data-source-badge mock">📊 DEMO</div>';
    
    return `
        <div class="deal-card" data-airline="${deal.airline}" data-region="${deal.region}">
            <div class="deal-header">
                <div class="airline-name">${deal.airline}</div>
                <div class="header-badges">
                    ${dataSourceBadge}
                    <div class="deal-badge" style="background-color: ${getAvailabilityColor(deal.availability)}">
                        ${deal.availability}
                    </div>
                </div>
            </div>
            
            <div class="route">${deal.route}</div>
            
            <div class="deal-details">
                <div class="detail-item">
                    <span class="detail-label">Miles Required:</span>
                    <span class="detail-value miles-required">${formatMiles(deal.milesRequired)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Regular Price:</span>
                    <span class="detail-value">${formatCurrency(deal.regularPrice)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">With Miles:</span>
                    <span class="detail-value">${formatCurrency(deal.mileagePrice)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">You Save:</span>
                    <span class="detail-value savings">${formatCurrency(deal.savings)}</span>
                </div>
            </div>
            
            <div class="deal-footer">
                <div class="valid-until">
                    Valid until: ${formatDate(deal.validUntil)}
                </div>
                <button class="book-button" onclick="bookDeal(${deal.id})">
                    Book Now
                </button>
            </div>
        </div>
    `;
}

function renderDeals(deals) {
    const container = document.getElementById('dealsContainer');
    
    if (isLoading) {
        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <h3>Loading latest deals...</h3>
                <p>Fetching real-time airline mileage data</p>
            </div>
        `;
        return;
    }
    
    if (deals.length === 0) {
        container.innerHTML = `
            <div class="no-deals">
                <h3>No deals match your current filters</h3>
                <p>Try adjusting your filter criteria to see more options.</p>
                <button onclick="refreshDeals()" class="refresh-button">🔄 Refresh Deals</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = deals.map(deal => createDealCard(deal)).join('');
}

function filterDeals() {
    const airlineFilter = document.getElementById('airlineFilter').value;
    const regionFilter = document.getElementById('regionFilter').value;
    
    filteredDeals = mileageDeals.filter(deal => {
        const matchesAirline = !airlineFilter || deal.airline === airlineFilter;
        const matchesRegion = !regionFilter || deal.region === regionFilter;
        return matchesAirline && matchesRegion;
    });
    
    renderDeals(filteredDeals);
}

function bookDeal(dealId) {
    const deal = mileageDeals.find(d => d.id === dealId);
    if (deal) {
        alert(`Redirecting to book ${deal.airline} flight: ${deal.route}\n\nMiles Required: ${formatMiles(deal.milesRequired)}\nTotal Cost: ${formatCurrency(deal.mileagePrice)}\n\n(In a real app, this would redirect to the airline's booking page)`);
    }
}

async function fetchDeals() {
    try {
        isLoading = true;
        renderDeals([]);
        
        const response = await fetch('/api/deals');
        const result = await response.json();
        
        if (result.success) {
            mileageDeals = result.data;
            filteredDeals = [...mileageDeals];
            dataSource = result.source;
            updateDataSourceIndicator(result.source);
            updateLastUpdated(result.timestamp);
        } else {
            console.error('API Error:', result.error);
            showError('Failed to load deals: ' + result.error);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        showError('Network error. Please check your connection.');
    } finally {
        isLoading = false;
        renderDeals(filteredDeals);
    }
}

async function refreshDeals() {
    try {
        isLoading = true;
        renderDeals([]);
        
        const response = await fetch('/api/deals/refresh', { method: 'POST' });
        const result = await response.json();
        
        if (result.success) {
            mileageDeals = result.data;
            filteredDeals = [...mileageDeals];
            updateDataSourceIndicator('live');
            updateLastUpdated(result.timestamp);
            showSuccess('Deals refreshed successfully!');
        } else {
            console.error('Refresh Error:', result.error);
            showError('Failed to refresh deals: ' + result.error);
        }
    } catch (error) {
        console.error('Refresh Error:', error);
        showError('Network error during refresh.');
    } finally {
        isLoading = false;
        renderDeals(filteredDeals);
    }
}

function updateDataSourceIndicator(source) {
    const indicator = document.getElementById('dataSourceIndicator');
    if (indicator) {
        indicator.textContent = source === 'live' ? '🔴 Live Data' : '📊 Demo Data';
        indicator.className = `data-source ${source}`;
    }
}

function updateLastUpdated(timestamp) {
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement) {
        const date = new Date(timestamp || Date.now());
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/New_York'
        };
        
        lastUpdatedElement.textContent = date.toLocaleDateString('en-US', options) + ' ET';
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-toast';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

async function initializeApp() {
    document.getElementById('airlineFilter').addEventListener('change', filterDeals);
    document.getElementById('regionFilter').addEventListener('change', filterDeals);
    
    await fetchDeals();
}

document.addEventListener('DOMContentLoaded', initializeApp);