import "dotenv/config";
import { connectDatabase } from "../config/database";
import { InsightIQService } from "../services/insightiq.service";
import { InfluencerModel } from "../core/models/influencer.model";
import dotenv from "dotenv";
dotenv.config();

// Function to transform InsightIQ profile to our influencer model format
const transformProfile = (profile: any) => {
  const platformProfile = {
    full_name: profile.full_name,
    url: profile.url,
    image_url: profile.image_url,
    follower_count: profile.follower_count,
    connection_count: profile.connection_count,
    introduction: profile.introduction || "",
    profile_headline: profile.profile_headline,
    external_id: profile.external_id,
    user_id: profile.external_id,
    creator_account_type: profile.creator_account_type || [],
    work_platform: {
      id: profile.work_platform_id,
      name: "LinkedIn",
      logo_url: "https://example.com/linkedin-logo.png" // You might want to update this
    },
    creator_location: {
      city: profile.creator_location?.city || "",
      state: profile.creator_location?.state || "",
      country: profile.creator_location?.country || ""
    },
    talks_about: profile.talks_about || [],
    open_to: profile.open_to || [],
    current_positions: profile.current_positions || [],
    engagement_rate: profile.engagement_rate,
    metadata: {
      lastUpdated: new Date(),
      dataSource: "InsightIQ",
      lastSyncDate: new Date(),
      platformSpecificData: {}
    }
  };

  const uiProfile = {
    handle: profile.full_name.split(" ")[0].toLowerCase(),
    role: profile.current_positions?.[0]?.title || "",
    avatarUrl: profile.image_url,
    bio: profile.introduction || "",
    location: `${profile.creator_location?.city || ""}, ${profile.creator_location?.country || ""}`.trim(),
    gender: "Not Specified",
    accountType: profile.creator_account_type || [],
    isVerified: false,
    contactIconUrl: "",
    socialLinks: [{
      platform: "LinkedIn",
      url: profile.url
    }],
    categories: [],
    tags: [],
    topics: profile.talks_about || [],
    interests: profile.open_to || [],
    expertise: [],
    performance: {
      engagementRate: profile.engagement_rate,
      reach: profile.follower_count,
      impressions: 0
    },
    pricing: {
      minimumBudget: 0,
      maximumBudget: 0,
      currency: "USD"
    },
    audienceDemographics: {
      ageRanges: {},
      genderDistribution: {},
      locations: {},
      languages: {}
    }
  };

  return {
    influencer_id: platformProfile.external_id,
    platform_profiles: [platformProfile],
    ui_profile: uiProfile,
    metadata: {
      lastSyncDate: new Date(),
      dataSource: "InsightIQ",
      lastUpdated: new Date()
    }
  };
};

const fetchProfiles = async () => {
  try {
    // Check for required environment variables
    if (!process.env.INSIGHTIQ_API_KEY) {
      throw new Error("INSIGHTIQ_API_KEY environment variable is not set");
    }

    // Connect to database
    await connectDatabase();
    console.log("Connected to database");

    // Fix the problematic username index
    console.log("Checking for and removing username index...");
    try {
      const indexInfo = await InfluencerModel.collection.indexInformation();
      console.log("Current indexes:", Object.keys(indexInfo));
      
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
    } catch (error) {
      console.error("Error fixing indexes:", error);
      // Continue with the script even if index fixing fails
    }

    // Initialize InsightIQ service
    const insightIQService = new InsightIQService();
    console.log("Initialized InsightIQ service");

    // Example search parameters
    const searchParams = {
      work_platform_id: "36410629-f907-43ba-aa0d-434ca9c0501a", // LinkedIn platform ID
      follower_count: {
        min: 10000,
        max: 1000000,
      },
      has_contact_details: true,
      page: 1,
      limit: 100,
    };

    // Fetch and store profiles
    console.log("Starting to fetch profiles from InsightIQ...");
    const result = await insightIQService.searchProfiles(searchParams);

    console.log(`\nSearch Results:`);
    console.log(`Total profiles found: ${result.total}`);
    console.log(`Current page: ${result.page}`);
    console.log(`Total pages: ${result.totalPages}`);

    // Store profiles in database
    console.log("\nStoring profiles in database...");
    let successCount = 0;
    let errorCount = 0;
    
    for (const profile of result.profiles) {
      try {
        const transformedProfile = transformProfile(profile);
        
        // Update or insert the profile
        await InfluencerModel.findOneAndUpdate(
          { influencer_id: transformedProfile.influencer_id },
          transformedProfile,
          { upsert: true, new: true }
        );
        
        console.log(`Stored profile for: ${profile.full_name}`);
        successCount++;
      } catch (error: any) {
        console.error(`Error storing profile for ${profile.full_name}:`, error.message);
        // Log detailed error information for debugging
        if (error.name === 'CastError') {
          console.error(`Cast error at path: ${error.path}, value type: ${error.valueType}`);
          if (error.reason) {
            console.error(`Reason: ${error.reason.message}`);
          }
        }
        errorCount++;
      }
    }

    console.log("\nProfile storage completed!");
    console.log(`Successfully stored: ${successCount} profiles`);
    console.log(`Failed to store: ${errorCount} profiles`);
    // console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error in fetchProfiles script:", error);
    process.exit(1);
  }
};

// Run the script
fetchProfiles();
