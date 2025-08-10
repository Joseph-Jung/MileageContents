const axios = require('axios');
require('dotenv').config();

class FlightDataService {
    constructor() {
        this.apiKey = process.env.AVIATIONSTACK_API_KEY;
        this.baseURL = process.env.AVIATIONSTACK_BASE_URL || 'http://api.aviationstack.com/v1';
        this.useLiveData = process.env.USE_LIVE_DATA === 'true';
        this.cache = new Map();
        this.cacheDuration = (process.env.CACHE_DURATION_MINUTES || 30) * 60 * 1000; // Convert to milliseconds
    }

    async getFlightDeals() {
        if (!this.useLiveData) {
            return this.getMockData();
        }

        const cacheKey = 'flight-deals';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }

        try {
            const flights = await this.fetchFlightData();
            const deals = this.transformToMileageDeals(flights);
            
            this.cache.set(cacheKey, {
                data: deals,
                timestamp: Date.now()
            });
            
            return deals;
        } catch (error) {
            console.error('Error fetching live flight data:', error.message);
            // Fallback to mock data if API fails
            return this.getMockData();
        }
    }

    async fetchFlightData() {
        if (!this.apiKey) {
            throw new Error('AVIATIONSTACK_API_KEY not configured');
        }

        const popularRoutes = [
            { dep: 'JFK', arr: 'CDG' }, // New York → Paris
            { dep: 'LAX', arr: 'NRT' }, // Los Angeles → Tokyo  
            { dep: 'ORD', arr: 'LHR' }, // Chicago → London
            { dep: 'DEN', arr: 'LAS' }, // Denver → Las Vegas
            { dep: 'BOS', arr: 'BGI' }, // Boston → Barbados
            { dep: 'SEA', arr: 'AMS' }, // Seattle → Amsterdam
            { dep: 'SFO', arr: 'SIN' }, // San Francisco → Singapore
            { dep: 'MIA', arr: 'MEX' }  // Miami → Mexico City
        ];

        const flightPromises = popularRoutes.map(route => 
            this.fetchRouteData(route.dep, route.arr)
        );

        const results = await Promise.allSettled(flightPromises);
        const flights = results
            .filter(result => result.status === 'fulfilled')
            .flatMap(result => result.value)
            .slice(0, 8); // Limit to 8 deals

        return flights;
    }

    async fetchRouteData(departure, arrival) {
        try {
            const response = await axios.get(`${this.baseURL}/flights`, {
                params: {
                    access_key: this.apiKey,
                    dep_iata: departure,
                    arr_iata: arrival,
                    limit: 1
                },
                timeout: 10000
            });

            return response.data.data || [];
        } catch (error) {
            console.warn(`Failed to fetch data for ${departure} → ${arrival}:`, error.message);
            return [];
        }
    }

    transformToMileageDeals(flights) {
        const airlineMap = {
            'DL': 'Delta',
            'UA': 'United', 
            'AA': 'American',
            'WN': 'Southwest',
            'B6': 'JetBlue',
            'AS': 'Alaska'
        };

        const regionMap = {
            'US': 'Domestic',
            'CA': 'Domestic',
            'FR': 'Europe', 'GB': 'Europe', 'NL': 'Europe', 'DE': 'Europe',
            'JP': 'Asia', 'SG': 'Asia', 'TH': 'Asia',
            'BB': 'Caribbean', 'JM': 'Caribbean',
            'MX': 'Domestic'
        };

        return flights.map((flight, index) => {
            const airline = airlineMap[flight.airline?.iata] || flight.airline?.name || 'Unknown';
            const depAirport = flight.departure?.airport || 'Unknown';
            const arrAirport = flight.arrival?.airport || 'Unknown';
            const route = `${depAirport} → ${arrAirport}`;
            
            const region = regionMap[flight.arrival?.country_iso2] || 'International';
            
            // Generate realistic mileage data based on route distance/type
            const baseMiles = this.calculateBaseMiles(region);
            const basePrice = this.calculateBasePrice(region);
            const mileagePrice = Math.floor(basePrice * 0.3);
            const savings = basePrice - mileagePrice;

            // Generate future valid date (7-30 days from now)
            const validDate = new Date();
            validDate.setDate(validDate.getDate() + Math.floor(Math.random() * 24) + 7);

            const availabilityOptions = ['Excellent', 'Good', 'Limited'];
            const availability = availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)];

            return {
                id: index + 1,
                airline,
                route,
                region,
                milesRequired: baseMiles,
                regularPrice: basePrice,
                mileagePrice,
                savings,
                validUntil: validDate.toISOString().split('T')[0],
                availability,
                isLiveData: true,
                lastUpdated: new Date().toISOString()
            };
        });
    }

    calculateBaseMiles(region) {
        const milesByRegion = {
            'Domestic': [15000, 30000],
            'Europe': [45000, 60000],
            'Asia': [70000, 90000],
            'Caribbean': [30000, 40000],
            'International': [50000, 80000]
        };

        const [min, max] = milesByRegion[region] || [40000, 70000];
        return min + Math.floor(Math.random() * (max - min));
    }

    calculateBasePrice(region) {
        const priceByRegion = {
            'Domestic': [250, 500],
            'Europe': [650, 1000],
            'Asia': [1000, 1500],
            'Caribbean': [500, 800],
            'International': [700, 1200]
        };

        const [min, max] = priceByRegion[region] || [500, 900];
        return min + Math.floor(Math.random() * (max - min));
    }

    getMockData() {
        return [
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
                availability: "Limited",
                isLiveData: false
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
                availability: "Good",
                isLiveData: false
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
                availability: "Limited",
                isLiveData: false
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
                availability: "Excellent",
                isLiveData: false
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
                availability: "Good",
                isLiveData: false
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
                availability: "Limited",
                isLiveData: false
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
                availability: "Good",
                isLiveData: false
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
                availability: "Excellent",
                isLiveData: false
            }
        ];
    }

    clearCache() {
        this.cache.clear();
    }
}

module.exports = FlightDataService;