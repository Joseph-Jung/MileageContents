const express = require('express');
const path = require('path');
const FlightDataService = require('./services/flightDataService');

const app = express();
const PORT = process.env.PORT || 3000;
const flightDataService = new FlightDataService();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Airline Mileage Deals API is running',
        timestamp: new Date().toISOString(),
        useLiveData: process.env.USE_LIVE_DATA === 'true'
    });
});

app.get('/api/deals', async (req, res) => {
    try {
        const deals = await flightDataService.getFlightDeals();
        res.json({
            success: true,
            data: deals,
            timestamp: new Date().toISOString(),
            source: deals[0]?.isLiveData ? 'live' : 'mock'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch flight deals',
            message: error.message
        });
    }
});

app.post('/api/deals/refresh', async (req, res) => {
    try {
        flightDataService.clearCache();
        const deals = await flightDataService.getFlightDeals();
        res.json({
            success: true,
            message: 'Deals refreshed successfully',
            data: deals,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to refresh flight deals',
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🛫 Airline Mileage Deals server running on http://localhost:${PORT}`);
    console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});
