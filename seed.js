const { MongoClient } = require("mongodb");

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found.");
    process.exit(1);
  }
  
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db("whatNow");
    
    console.log("Creating default profile...");
    const result = await db.collection("profiles").insertOne({
      name: "Test User",
      color: "bg-blue-500",
      watchHistory: []
    });
    
    console.log(`Successfully created profile with ID: ${result.insertedId}`);
  } catch (error) {
    console.error("Error seeding:", error);
  } finally {
    await client.close();
  }
}

seed();
