import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
dotenv.config();

async function inspectPinecone() {
  try {
    console.log('Connecting to Pinecone...');
    console.log(`API Key: ${process.env.PINECONE_API_KEY?.substring(0, 20)}...`);
    console.log(`Index Name: ${process.env.PINECONE_INDEX_NAME}`);
    
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
    
    // Get index stats
    console.log('\n=== Index Statistics ===');
    const stats = await index.describeIndexStats();
    console.log(JSON.stringify(stats, null, 2));
    
    // Try to query with random vector to get some results
    console.log('\n=== Querying with Random Vector ===');
    try {
      const dimension = stats.dimension || 384;
      // Create a random vector (not zero)
      const randomVector = Array.from({ length: dimension }, () => Math.random() * 2 - 1);
      
      const queryResult = await index.query({
        vector: randomVector,
        topK: 10,
        includeMetadata: true
      });
      
      console.log(`Query returned ${queryResult.matches?.length || 0} results`);
      
      if (queryResult.matches && queryResult.matches.length > 0) {
        console.log('\n=== Sample Vector Details ===');
        queryResult.matches.slice(0, 5).forEach((match, i) => {
          console.log(`\n${'='.repeat(80)}`);
          console.log(`${i + 1}. Vector ID: ${match.id}`);
          console.log(`   Score: ${match.score}`);
          console.log(`   Metadata:`, JSON.stringify(match.metadata, null, 2));
          
          // Show text preview if available
          const text = match.metadata?.text || match.metadata?.content || match.metadata?.description || '';
          if (text) {
            console.log(`\n   Text Preview (first 300 chars):`);
            console.log(`   ${text.substring(0, 300)}...`);
          }
        });
        
        // Analyze metadata structure
        console.log(`\n${'='.repeat(80)}`);
        console.log('=== Metadata Structure Analysis ===');
        const allKeys = new Set();
        queryResult.matches.forEach(m => {
          if (m.metadata) {
            Object.keys(m.metadata).forEach(k => allKeys.add(k));
          }
        });
        console.log('Available metadata fields:', Array.from(allKeys).join(', '));
      }
    } catch (queryError) {
      console.log('Query error:', queryError.message);
    }
    
    // Try querying with a zero vector
    console.log('\n=== Trying Query with Zero Vector ===');
    try {
      const dimension = stats.dimension || 384;
      const zeroVector = new Array(dimension).fill(0);
      
      const queryResult = await index.query({
        vector: zeroVector,
        topK: 5,
        includeMetadata: true
      });
      
      console.log(`Query returned ${queryResult.matches?.length || 0} results`);
      if (queryResult.matches && queryResult.matches.length > 0) {
        queryResult.matches.forEach((match, i) => {
          console.log(`\n${i + 1}. Score: ${match.score}`);
          console.log('   ID:', match.id);
          console.log('   Metadata:', JSON.stringify(match.metadata, null, 2));
        });
      }
    } catch (queryError) {
      console.log('Query error:', queryError.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

inspectPinecone()
  .then(() => {
    console.log('\n✅ Inspection complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
