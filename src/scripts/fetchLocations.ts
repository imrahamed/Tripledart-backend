import 'dotenv/config';
import { connectDatabase } from '../config/database';
import { LocationService } from '../core/services/location.service';
import dotenv from "dotenv";
dotenv.config();


const fetchLocations = async () => {
    try {
        // Connect to database
        await connectDatabase();
        console.log('Connected to database');

        // Fetch and store locations
        console.log('Starting to fetch locations from InsightIQ...');
        const totalStored = await LocationService.fetchAndStoreLocations();
        console.log(`Successfully stored ${totalStored} locations`);

        // List all stored locations
        const locations = await LocationService.listLocations();
        console.log('\nStored locations:');
        locations.forEach(location => {
            console.log(`${location.name} (${location.type})`);
        });

    } catch (error) {
        console.error('Error in fetchLocations script:', error);
        process.exit(1);
    }
};

// Run the script
fetchLocations(); 