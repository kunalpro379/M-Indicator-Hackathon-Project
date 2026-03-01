import reactPolicyAgent from '../src/services/react-policy.service.js';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function populatePoliciesWithReactAgent() {
  const client = await pool.connect();
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('STARTING REACT AGENT POLICY EXTRACTION');
    console.log('='.repeat(80));
    console.log(`Pinecone Index: ${process.env.PINECONE_INDEX_NAME}`);
    console.log(`Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'Connected'}`);
    console.log('='.repeat(80) + '\n');

    // Get all departments
    const deptResult = await client.query(`
      SELECT id, name, description FROM departments ORDER BY name
    `);

    console.log(`Found ${deptResult.rows.length} departments to process\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < deptResult.rows.length; i++) {
      const dept = deptResult.rows[i];
      
      console.log(`\n${'█'.repeat(80)}`);
      console.log(`DEPARTMENT ${i + 1}/${deptResult.rows.length}: ${dept.name}`);
      console.log('█'.repeat(80));

      try {
        // Use ReAct agent to find policies
        const results = await reactPolicyAgent.findPolicies(dept.name);
        
        // Convert to markdown
        const markdown = reactPolicyAgent.convertToMarkdown(dept.name, results);
        
        // Update database
        await client.query(`
          UPDATE departments
          SET policies = $1, updated_at = NOW()
          WHERE id = $2
        `, [markdown, dept.id]);

        console.log(`\n✅ SUCCESS: Updated policies for ${dept.name}`);
        console.log(`   Results found: ${results.length}`);
        console.log(`   Markdown length: ${markdown.length} characters`);
        console.log(`   Preview: ${markdown.substring(0, 150)}...`);
        
        successCount++;
      } catch (error) {
        console.error(`\n❌ FAILED: Error processing ${dept.name}`);
        console.error(`   Error: ${error.message}`);
        failCount++;
      }

      // Delay between departments to avoid rate limiting
      if (i < deptResult.rows.length - 1) {
        console.log(`\n⏳ Waiting 2 seconds before next department...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n\n${'='.repeat(80)}`);
    console.log('FINAL SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully processed: ${successCount} departments`);
    console.log(`❌ Failed: ${failCount} departments`);
    console.log(`📊 Success rate: ${((successCount / deptResult.rows.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(80) + '\n');

    // Show sample of updated policies
    console.log('Sample of updated policies:\n');
    const sampleResult = await client.query(`
      SELECT name, 
             CASE 
               WHEN policies IS NOT NULL THEN LENGTH(policies)
               ELSE 0
             END as policy_length,
             CASE 
               WHEN policies IS NOT NULL THEN SUBSTRING(policies, 1, 200)
               ELSE 'No policies'
             END as preview
      FROM departments
      ORDER BY name
      LIMIT 3
    `);

    sampleResult.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.name}`);
      console.log(`   Length: ${row.policy_length} characters`);
      console.log(`   Preview: ${row.preview}...`);
      console.log('');
    });

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
populatePoliciesWithReactAgent()
  .then(() => {
    console.log('\n✅ Policy extraction with ReAct agent completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
