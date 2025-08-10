# MileageContents Node.js Project

## Build Requirements

### Feature Requirements
1. **Latest Airline Mileage Deals Page**
   - Display current month's airline mileage deals
   - Show deal details including airlines, routes, and mileage requirements
   - Update deals monthly with fresh content

2. **Responsive Web Design**
   - Accessible via webpage with responsive design
   - Mobile-friendly interface
   - Cross-browser compatibility
   - Optimized for desktop, tablet, and mobile devices

3. **Live Data Integration**
   - Pull live airline mileage deals instead of mock data
   - Real-time integration with airline APIs or data sources
   - Automatic updates to ensure deal accuracy

   **Implementation Details:**
   - **API Service Layer**: `services/flightDataService.js` with Aviationstack integration
   - **Fallback System**: Gracefully switches to mock data when live API is unavailable
   - **Smart Caching**: 30-minute cache system to optimize API calls and performance
   - **Error Handling**: Robust error handling with user-friendly notifications
   - **Configuration Management**: Environment variables for API keys and feature flags

   **API Endpoints:**
   - `GET /api/deals` - Retrieve current mileage deals (live or mock data)
   - `POST /api/deals/refresh` - Force refresh deals data from live sources
   - `GET /health` - System health check with data source status

   **UI Features:**
   - Live/Demo data indicators on each deal card (🔴 LIVE / 📊 DEMO)
   - Manual refresh button for real-time updates
   - Loading states with animated spinner
   - Toast notifications for success/error states
   - Data source status in header

   **Configuration:**
   ```bash
   # Required environment variables (see .env.example)
   AVIATIONSTACK_API_KEY=your_api_key_here
   USE_LIVE_DATA=true
   CACHE_DURATION_MINUTES=30
   ```

   **Setup Instructions:**
   1. Sign up for Aviationstack API at https://aviationstack.com/
   2. Copy `.env.example` to `.env` and add your API key
   3. Set `USE_LIVE_DATA=true` to enable live data mode
   4. Restart server to apply configuration changes

   **Data Sources:**
   - **Live Mode**: Aviationstack Flight API for real-time airline data
   - **Demo Mode**: Curated mock dataset with realistic pricing and routes
   - **Hybrid Approach**: Live data transformed into mileage deal format with realistic calculations


---
This project provides airline mileage deals information through a responsive web interface.
