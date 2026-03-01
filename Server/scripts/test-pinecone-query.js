import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

async function testPineconeQuery() {
  console.log('\n=== TESTING PINECONE QUERY METHOD ===\n');
  
  try {
    // Create a dummy embedding vector (384 dimensions, all zeros)
    const dummyVector = new Array(384).fill(0);
    
    // Try querying with the dummy vector
    console.log('Attempting query with dummy vector...');
    const queryResult = await index.query({
      vector: dummyVector,
      topK: 10,
      includeMetadata: true,
      includeValues: false
    });
    
    console.log('\n✅ Query successful!');
    console.log(`Found ${queryResult.matches?.length || 0} matches`);
    
    if (queryResult.matches && queryResult.matches.length > 0) {
      console.log('\n--- First 3 Matches ---');
      queryResult.matches.slice(0, 3).forEach((match, idx) => {
        console.log(`\nMatch ${idx + 1}:`);
        console.log(`  ID: ${match.id}`);
        console.log(`  Score: ${match.score}`);
        console.log(`  Metadata:`, JSON.stringify(match.metadata, null, 2));
      });
    }
    
  } catch (error) {
    console.error('❌ Query Error:', error.message);
  }
}

testPineconeQuery();
