# 🛡️ Survival Kit Dashboard

An IoT-powered emergency management system that monitors and coordinates survival kits in real-time. This dashboard provides centralized monitoring of distributed survival kit sensors, automated threshold alerts, and emergency communication capabilities.

## 🌟 Features

### Real-Time IoT Monitoring
- **Multi-Sensor Data Collection**: Temperature, humidity, air pressure, air quality, CO levels, combustible gas, and water quality
- **ThingSpeak Integration**: Live data feeds from IoT sensors (Channel ID: 2925202)
- **Automated Data Refresh**: Updates every 30 seconds
- **Visual Status Indicators**: Color-coded device markers on interactive map

### Emergency Management
- **Command Center**: Central hub for coordinating all survival kits
- **Alert Broadcasting**: Send emergency messages to all survival kits
- **Mesh Network Visualization**: Shows connectivity between devices
- **Route Planning**: Optimal path calculation for emergency response

### Intelligent Monitoring
- **Threshold Alerts**: Automatic warnings when sensor values exceed safe ranges
- **Real-Time Notifications**: Instant alerts for critical conditions
- **Message Logging**: Complete communication history between devices
- **Device Status Tracking**: Battery levels, signal strength, and connectivity status

## 🗺️ Interactive Map Features

### Device Network
- **8 Survival Kits** distributed across Syracuse, NY area
- **1 Command Center** coordinating all operations
- **Mesh Connectivity** showing device-to-device communication paths
- **Click-to-Connect** functionality for establishing communication routes

### Sensor Thresholds
```
Temperature:    15°C - 30°C
Humidity:       40% - 80%
Pressure:       980 - 1020 hPa
Air Quality:    0 - 500 IAQ
CO Level:       0 - 50 ppm
Combustible Gas: 0 - 1000 ppm
Water Quality:  0 - 1000 ppm TDS
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.3.0 with React 19
- **Mapping**: Leaflet & React-Leaflet for interactive maps
- **Styling**: Tailwind CSS for responsive design
- **TypeScript**: Full type safety and better developer experience
- **IoT Integration**: ThingSpeak API for real-time sensor data
- **Real-time Updates**: Automatic data polling and state management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd survival-kit
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Dashboard Components

### 1. Interactive Map
- Real-time device locations around Syracuse, NY
- Color-coded status indicators
- Mesh network connectivity visualization
- Click devices to establish communication routes

### 2. Alert System
- Broadcast emergency messages to all survival kits
- Real-time message composition and sending
- Command center controls

### 3. Threshold Monitoring
- Automatic sensor value monitoring
- Instant alerts for out-of-range readings
- Historical alert tracking (last 20 alerts)

### 4. Message Log
- Complete communication history
- Device-to-device message routing
- Timestamp tracking (last 10 messages)

## 🔧 Configuration

### ThingSpeak Setup
The application connects to ThingSpeak channel `2925202` for live IoT data. Update the configuration in `src/app/components/thingspeak.ts`:

```typescript
const THINGSPEAK_CHANNEL_ID = "2925202";
const THINGSPEAK_API_KEY = "HMV972GTSEJJB3FZ";
```

### Device Configuration
Survival kit locations and configurations are managed in `src/app/components/devices.ts`. Each device includes:
- GPS coordinates
- Sensor thresholds
- Network connectivity
- Status monitoring

## 🏗️ Project Structure

```
survival-kit/
├── src/app/
│   ├── components/
│   │   ├── Map.tsx              # Interactive Leaflet map
│   │   ├── AlertPanel.tsx       # Emergency alert system
│   │   ├── ThresholdAlertsPanel.tsx # Sensor monitoring
│   │   ├── MessageLogPanel.tsx  # Communication history
│   │   ├── devices.ts           # Device configurations
│   │   └── thingspeak.ts        # IoT data integration
│   ├── types/                   # TypeScript definitions
│   ├── styles/                  # CSS styling
│   └── page.tsx                 # Main dashboard
```

## 🚨 Emergency Protocols

### Alert Conditions
The system automatically generates alerts for:
- Temperature outside 15-30°C range
- Humidity below 40% or above 80%
- Dangerous CO levels (>50 ppm)
- Poor air quality (>500 IAQ)
- Water contamination (>1000 ppm TDS)

### Communication Flow
1. Sensors detect out-of-range values
2. Automatic threshold alert generated
3. Message sent to Command Center
4. Alert logged in dashboard
5. Optional manual broadcast to all kits

## 📈 Data Sources

- **Live IoT Data**: ThingSpeak platform integration
- **Simulated Networks**: Mesh connectivity simulation
- **Real-time Updates**: 30-second refresh intervals
- **Historical Tracking**: Message and alert history

## 🔮 Future Enhancements

- Weather API integration
- Predictive analytics for sensor trends
- Mobile app companion
- Advanced routing algorithms
- Integration with emergency services
- Multi-channel ThingSpeak support

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices
- Various screen resolutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of an IoT emergency management system. Please ensure proper attribution when using or modifying this code.

## 🆘 Support

For technical support or questions about the survival kit dashboard:
- Check the console for error messages
- Verify ThingSpeak API connectivity
- Ensure all dependencies are properly installed
- Review device configurations in `devices.ts`

---

**Emergency Contact**: This system is designed for emergency preparedness and response coordination.
