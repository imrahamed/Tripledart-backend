import "dotenv/config";
import { connectDatabase } from "../config/database";
import { InfluencerModel } from "../core/models/influencer.model";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function fixIndexes() {
  try {
    // Connect to database
    await connectDatabase();
    console.log("Connected to database");

    console.log("Getting current indexes...");
    const indexInfo = await InfluencerModel.collection.indexInformation();
    console.log("Current indexes:", JSON.stringify(indexInfo, null, 2));

    // Drop the problematic username index if it exists
    if (indexInfo.username_1) {
      console.log("Dropping username_1 index...");
      await InfluencerModel.collection.dropIndex("username_1");
      console.log("Index dropped successfully");
    } else {
      console.log("No username_1 index found");
    }

    // Check for any other indexes that might cause issues
    const indexNames = Object.keys(indexInfo);
    for (const indexName of indexNames) {
      if ((indexName.includes("username") || 
           indexName.includes("phylloData.profileId") || 
           indexName.includes("userId")) && 
          indexName !== "_id_") {
        console.log(`Dropping problematic index: ${indexName}`);
        await InfluencerModel.collection.dropIndex(indexName);
      }
    }

    // Verify indexes after changes
    const updatedIndexInfo = await InfluencerModel.collection.indexInformation();
    console.log("Updated indexes:", JSON.stringify(updatedIndexInfo, null, 2));

    console.log("Index cleanup completed!");
  } catch (error) {
    console.error("Error fixing indexes:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

// Run the script
fixIndexes(); 