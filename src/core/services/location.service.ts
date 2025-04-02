import { Location, ILocation } from '../models/location.model';
import axios from 'axios';


export class LocationService {
    private static readonly INSIGHTIQ_API_URL = `${process.env.INSIGHTIQ_BASE_URL}/social/creators/dictionary/locations`;
    private static readonly BATCH_SIZE = 100;

    static async fetchAndStoreLocations() {
        try {
            let offset = 0;
            let hasMore = true;
            let totalStored = 0;

            while (hasMore) {
                const response = await axios.get(this.INSIGHTIQ_API_URL, {
                    params: {
                        limit: this.BATCH_SIZE,
                        offset: offset
                    },
                    headers: {
                        'Accept': 'application/json, application/xml',
                        'Authorization': `Basic ${process.env.INSIGHTIQ_API_KEY}`
                    }
                });

                const locations = response.data.data || [];
                if (locations.length === 0) {
                    hasMore = false;
                    continue;
                }

                // Process and store locations
                for (const location of locations) {
                    const locationData = this.transformLocationData(location);
                    await this.upsertLocation(locationData);
                    totalStored++;
                }

                offset += this.BATCH_SIZE;
                console.log(`Stored ${totalStored} locations so far...`);
            }

            return totalStored;
        } catch (error) {
            console.error('Error fetching locations:', error);
            throw error;
        }
    }

    private static transformLocationData(location: any): Partial<ILocation> {
        return {
            name: location.display_name,
            country: location.country || location.name,
            state: location.state,
            city: location.city,
            code: location.id,
            type: location.type,
            parentCode: location.parent_code,
            metadata: {
                lastUpdated: new Date(),
                dataSource: 'insightiq'
            }
        };
    }

    private static async upsertLocation(locationData: Partial<ILocation>) {
        try {
            await Location.findOneAndUpdate(
                { code: locationData.code },
                locationData,
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error(`Error upserting location ${locationData.code}:`, error);
            throw error;
        }
    }

    static async listLocations() {
        return await Location.find().sort({ name: 1 });
    }

    static async getLocationByCode(code: string) {
        return await Location.findOne({ code });
    }

    static async searchLocations(query: string) {
        return await Location.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { country: { $regex: query, $options: 'i' } },
                { state: { $regex: query, $options: 'i' } },
                { city: { $regex: query, $options: 'i' } }
            ]
        }).sort({ name: 1 });
    }
} 