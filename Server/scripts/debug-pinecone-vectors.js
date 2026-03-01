import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

async function debugPineconeVectors() {
  console.log('\n=== PINECONE DEBUG ===\n');
  
  try {
    // Get index stats
    const stats = await index.describeIndexStats();
    console.log('Index Stats:');
    console.log(JSON.stringify(stats, null, 2));
    
    // List vectors
    console.log('\n--- Listing Vectors ---');
    const listResult = await index.listPaginated({ limit: 5 });
    console.log('List Result:');
    console.log(JSON.stringify(listResult, null, 2));
    
    if (listResult.vectors && listResult.vectors.length > 0) {
      console.log('\n--- Vector Details ---');
      listResult.vectors.forEach((v, idx) => {
        console.log(`Vector ${idx + 1}:`);
        console.log(`  ID: "${v.id}" (type: ${typeof v.id}, length: ${v.id?.length || 0})`);
        console.log(`  Full object:`, JSON.stringify(v, null, 2));
      });
      
      // Try to fetch first vector using namespace
      console.log('\n--- Attempting to Fetch First Vector with Namespace ---');
      const firstId = listResult.vectors[0].id;
      const namespace = listResult.namespace || '__default__';
      console.log(`Namespace: "${namespace}"`);
      console.log(`Fetching ID: "${firstId}"`);
      
      try {
        const nsIndex = index.namespace(namespace);
        const fetchResult = await nsIndex.fetch([firstId]);
        console.log('Fetch Result:');
        console.log(JSON.stringify(fetchResult, null, 2));
      } catch (fetchErr) {
        console.error('Fetch Error:', fetchErr.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugPineconeVectors();
