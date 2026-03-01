import enhancedReactAgent from '../src/services/enhanced-react-policy.service.js';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updatePoliciesWithEnhancedReact() {
  const client = await pool.connect();
  
  try {
    console.log('\n' + '█'.repeat(80));
    console.log('ENHANCED REACT AGENT - POLICY UPDATE');
    console.log('█'.repeat(80));
    console.log(`Pinecone Index: ${process.env.PINECONE_INDEX_NAME}`);
    console.log(`Database: Connected`);
    console.log(`Mode: NO HALLUCINATION - Real data only`);
    console.log('█'.repeat(80) + '\n');

    // Check agent health
    console.log('🏥 Checking agent health...');
    const healthy = await enhancedReactAgent.checkHealth();
    
    if (!healthy) {
      console.error('❌ Agent health check failed. Cannot proceed.');
      return;
    }
    
    console.log('✅ Agent is healthy and ready\n');

    // Get all departments
    const deptResult = await client.query(`
      SELECT id, name, description 
      FROM departments 
      ORDER BY name
    `);

    console.log(`📋 Found ${deptResult.rows.length} departments to process\n`);

    let successCount = 0;
    let emptyCount = 0;
    let failCount = 0;

    for (let i = 0; i < deptResult.rows.length; i++) {
      const dept = deptResult.rows[i];
      
      console.log(`\n${'█'.repeat(80)}`);
      console.log(`PROCESSING ${i + 1}/${deptResult.rows.length}: ${dept.name}`);
      console.log(`ID: ${dept.id}`);
      console.log('█'.repeat(80));

      try {
        // Use Enhanced ReAct agent to find real policies
        const results = await enhancedReactAgent.findPolicies(dept.name);
        
        // Convert to markdown (no hallucination)
        const markdown = enhancedReactAgent.convertToMarkdown(dept.name, results);
        
        // Update database
        await client.query(`
          UPDATE departments
          SET policies = $1, updated_at = NOW()
          WHERE id = $2
        `, [markdown, dept.id]);

        if (results.length > 0) {
          console.log(`\n✅ SUCCESS: Found and stored ${results.length} real documents`);
          console.log(`   Markdown length: ${markdown.length} characters`);
          successCount++;
        } else {
          console.log(`\n⚠️  NO DATA: No documents found in Pinecone`);
          console.log(`   Stored honest "no data" message`);
          emptyCount++;
        }
        
        // Show preview
        const preview = markdown.substring(0, 200).replace(/\n/g, ' ');
        console.log(`   Preview: ${preview}...`);
        
      } catch (error) {
        console.error(`\n❌ FAILED: Error processing ${dept.name}`);
        console.error(`   Error: ${error.message}`);
        failCount++;
      }

      // Delay between departments
      if (i < deptResult.rows.length - 1) {
        console.log(`\n⏳ Waiting 2 seconds before next department...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n\n${'='.repeat(80)}`);
    console.log('FINAL SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully found data: ${successCount} departments`);
    console.log(`⚠️  No data found: ${emptyCount} departments`);
    console.log(`❌ Failed: ${failCount} departments`);
    console.log(`📊 Total processed: ${deptResult.rows.length} departments`);
    console.log('='.repeat(80) + '\n');

    // Show sample of updated policies
    console.log('📄 Sample of updated policies:\n');
    const sampleResult = await client.query(`
      SELECT 
        name, 
        LENGTH(policies) as policy_length,
        SUBSTRING(policies, 1, 150) as preview
      FROM departments
      WHERE policies IS NOT NULL
      ORDER BY name
      LIMIT 3
    `);

    sampleResult.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.name}`);
      console.log(`   Length: ${row.policy_length} characters`);
      console.log(`   Preview: ${row.preview}...`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('IMPORTANT NOTES');
    console.log('='.repeat(80));
    console.log('• This agent only returns REAL data from Pinecone');
    console.log('• No fake or hallucinated content is generated');
    console.log('• If no data is found, an honest message is stored');
    console.log('• All metadata from Pinecone is preserved as-is');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
updatePoliciesWithEnhancedReact()
  .then(() => {
    console.log('\n✅ Enhanced ReAct policy update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
