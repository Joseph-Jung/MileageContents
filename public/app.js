const mileageDeals = [
    {
        id: 1,
        airline: "Delta",
        route: "New York → Paris",
        region: "Europe",
        milesRequired: 50000,
        regularPrice: 850,
        mileagePrice: 350,
        savings: 500,
        validUntil: "2025-08-31",
        availability: "Limited"
    },
    {
        id: 2,
        airline: "United",
        route: "Los Angeles → Tokyo",
        region: "Asia",
        milesRequired: 70000,
        regularPrice: 1200,
        mileagePrice: 400,
        savings: 800,
        validUntil: "2025-08-25",
        availability: "Good"
    },
    {
        id: 3,
        airline: "American",
        route: "Chicago → London",
        region: "Europe",
        milesRequired: 45000,
        regularPrice: 750,
        mileagePrice: 280,
        savings: 470,
        validUntil: "2025-08-30",
        availability: "Limited"
    },
    {
        id: 4,
        airline: "Southwest",
        route: "Denver → Las Vegas",
        region: "Domestic",
        milesRequired: 15000,
        regularPrice: 280,
        mileagePrice: 85,
        savings: 195,
        validUntil: "2025-08-28",
        availability: "Excellent"
    },
    {
        id: 5,
        airline: "JetBlue",
        route: "Boston → Barbados",
        region: "Caribbean",
        milesRequired: 35000,
        regularPrice: 650,
        mileagePrice: 220,
        savings: 430,
        validUntil: "2025-08-27",
        availability: "Good"
    },
    {
        id: 6,
        airline: "Delta",
        route: "Seattle → Amsterdam",
        region: "Europe",
        milesRequired: 55000,
        regularPrice: 900,
        mileagePrice: 380,
        savings: 520,
        validUntil: "2025-08-29",
        availability: "Limited"
    },
    {
        id: 7,
        airline: "United",
        route: "San Francisco → Singapore",
        region: "Asia",
        milesRequired: 80000,
        regularPrice: 1400,
        mileagePrice: 450,
        savings: 950,
        validUntil: "2025-08-26",
        availability: "Good"
    },
    {
        id: 8,
        airline: "American",
        route: "Miami → Mexico City",
        region: "Domestic",
        milesRequired: 25000,
        regularPrice: 420,
        mileagePrice: 140,
        savings: 280,
        validUntil: "2025-08-31",
        availability: "Excellent"
    }
];

let filteredDeals = [...mileageDeals];

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
    return `
        <div class="deal-card" data-airline="${deal.airline}" data-region="${deal.region}">
            <div class="deal-header">
                <div class="airline-name">${deal.airline}</div>
                <div class="deal-badge" style="background-color: ${getAvailabilityColor(deal.availability)}">
                    ${deal.availability}
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
    
    if (deals.length === 0) {
        container.innerHTML = `
            <div class="no-deals">
                <h3>No deals match your current filters</h3>
                <p>Try adjusting your filter criteria to see more options.</p>
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

function updateLastUpdated() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/New_York'
    };
    
    document.getElementById('lastUpdated').textContent = 
        now.toLocaleDateString('en-US', options) + ' ET';
}

function initializeApp() {
    renderDeals(filteredDeals);
    updateLastUpdated();
    
    document.getElementById('airlineFilter').addEventListener('change', filterDeals);
    document.getElementById('regionFilter').addEventListener('change', filterDeals);
}

document.addEventListener('DOMContentLoaded', initializeApp);