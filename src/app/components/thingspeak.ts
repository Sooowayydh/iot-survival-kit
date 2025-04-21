// src/app/components/thingspeak.ts

interface ThingSpeakResponse {
    channel: {
        id: number;
        name: string;
        latitude: string;
        longitude: string;
        field1: string;  // Temperature
        field2: string;  // Humidity
        field3: string;  // Pressure
        field4: string;  // Air Quality
        field5: string;  // CO Level
        field6: string;  // Combustible Gas
        field7: string;  // Water Quality
        created_at: string;
        updated_at: string;
        last_entry_id: number;
    };
    feeds: Array<{
        created_at: string;
        entry_id: number;
        field1: string;
        field2: string;
        field3: string;
        field4: string;
        field5: string;
        field6: string;
        field7: string;
    }>;
}

// Threshold values for alerts
export const SENSOR_THRESHOLDS = {
    temperature: { min: 15, max: 30 },
    humidity: { min: 40, max: 80 },
    pressure: { min: 980, max: 1020 },
    airQuality: { min: 0, max: 500 },    // IAQ (Indoor Air Quality) index
    coLevel: { min: 0, max: 50 },        // CO in ppm
    combustibleGas: { min: 0, max: 1000 }, // LPG in ppm
    waterQuality: { min: 0, max: 1000 },  // TDS in ppm
};

const THINGSPEAK_CHANNEL_ID = "2925202";
const THINGSPEAK_API_KEY = "HMV972GTSEJJB3FZ";
const THINGSPEAK_API_URL = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json`;

export async function fetchThingSpeakData(): Promise<ThingSpeakResponse> {
    try {
        const response = await fetch(`${THINGSPEAK_API_URL}?api_key=${THINGSPEAK_API_KEY}&results=1`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching ThingSpeak data:', error);
        throw error;
    }
}

export function updateDeviceWithThingSpeakData(device: any, thingSpeakData: ThingSpeakResponse): any {
    if (!thingSpeakData.feeds || thingSpeakData.feeds.length === 0) {
        return device;
    }

    const latestFeed = thingSpeakData.feeds[0];
    
    return {
        ...device,
        temperature: parseFloat(latestFeed.field1) || device.temperature,
        humidity: parseFloat(latestFeed.field2) || device.humidity,
        pressure: parseFloat(latestFeed.field3) || device.pressure,
        airQuality: parseFloat(latestFeed.field4) || device.airQuality,
        coLevel: parseFloat(latestFeed.field5) || device.coLevel,
        combustibleGas: parseFloat(latestFeed.field6) || device.combustibleGas,
        waterQuality: parseFloat(latestFeed.field7) || device.waterQuality,
        lastReading: latestFeed.created_at,
    };
} 