import pool from '../src/config/database.js';
import * as helpers from '../src/services/agent.helpers.js';

async function testFieldWorkerState() {
  try {
    console.log('🧪 Testing Field Worker State Management\n');

    // Test user ID (use a real user ID from your database)
    const testUserId = '05a088ea-a5f0-4a9f-aab5-3ed97849fea3'; // Replace with actual user ID
    
    console.log('1️⃣ Loading initial state...');
    const state1 = await helpers.loadFieldWorkerState(testUserId);
    console.log('Initial state:', JSON.stringify(state1, null, 2));
    
    console.log('\n2️⃣ Updating state with description...');
    state1.report.description = 'Fixed water pipes';
    state1.missingFields = state1.missingFields.filter(f => f !== 'description');
    state1.currentQuestion = 'site';
    await helpers.saveFieldWorkerState(testUserId, state1);
    console.log('State saved!');
    
    console.log('\n3️⃣ Loading state again to verify...');
    const state2 = await helpers.loadFieldWorkerState(testUserId);
    console.log('Loaded state:', JSON.stringify(state2, null, 2));
    
    console.log('\n4️⃣ Verifying state persistence...');
    if (state2.report.description === 'Fixed water pipes') {
      console.log('✅ State persisted correctly!');
    } else {
      console.log('❌ State NOT persisted correctly!');
      console.log('Expected description: "Fixed water pipes"');
      console.log('Got description:', state2.report.description);
    }
    
    if (state2.currentQuestion === 'site') {
      console.log('✅ Current question persisted correctly!');
    } else {
      console.log('❌ Current question NOT persisted correctly!');
      console.log('Expected: "site"');
      console.log('Got:', state2.currentQuestion);
    }
    
    console.log('\n5️⃣ Checking database directly...');
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      'SELECT * FROM field_worker_states WHERE user_id = $1 AND date = $2',
      [testUserId, today]
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Record found in database');
      console.log('Database record:', JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('❌ No record found in database!');
    }
    
    console.log('\n6️⃣ Cleaning up test data...');
    await pool.query(
      'DELETE FROM field_worker_states WHERE user_id = $1 AND date = $2',
      [testUserId, today]
    );
    console.log('✅ Test data cleaned up');
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testFieldWorkerState();
