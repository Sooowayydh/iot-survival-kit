'use client';

import dynamic from 'next/dynamic';

// Dynamically import the Map component with no SSR
const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => <div className="map-loading">Loading map...</div>
});

export default function Home() {
  return (
    <div className="app">
      <header>
        <div className="container">
          <h1>Survival Kit Dashboard</h1>
        </div>
      </header>
      
      <main>
        <div className="container">
          <div className="grid">
            {/* Map Section */}
            <div className="card">
              <div className="card-header">
                <h2>Location Map</h2>
              </div>
              <div className="card-body">
                <Map center={[43.0481, -76.1474]} zoom={13} />
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="card">
              <div className="card-header">
                <h2>Statistics</h2>
              </div>
              <div className="card-body">
                <div className="stats">
                  <div className="stat-item blue">
                    <div className="stat-icon">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3>Active Devices</h3>
                      <p>9</p>
                    </div>
                  </div>
                  
                  <div className="stat-item green">
                    <div className="stat-icon">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3>System Status</h3>
                      <p>Operational</p>
                    </div>
                  </div>
                  
                  <div className="stat-item purple">
                    <div className="stat-icon">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <h3>Last Updated</h3>
                      <p>2 min ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
