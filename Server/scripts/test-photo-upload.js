/**
 * Test script for photo upload functionality
 * 
 * This script tests the uploadProofToBlob function with a sample media object
 * to ensure it can handle both fileUrl and data buffer uploads.
 */

import { uploadProofToBlob } from '../src/services/agent.helpers.js';
import dotenv from 'dotenv';

dotenv.config();

async function testPhotoUpload() {
  console.log('\n🧪 Testing Photo Upload Functionality\n');
  console.log('=' .repeat(50));

  // Test 1: Upload with fileUrl (simulating Telegram photo)
  console.log('\n📝 Test 1: Upload with fileUrl');
  console.log('-'.repeat(50));
  
  try {
    const testMediaWithUrl = {
      fileUrl: 'https://via.placeholder.com/150',
      mimeType: 'image/jpeg',
      fileName: 'test_photo.jpg'
    };

    console.log('Media object:', testMediaWithUrl);
    console.log('\n⏳ Uploading...');
    
    const url1 = await uploadProofToBlob('test-user-123', testMediaWithUrl);
    
    console.log('✅ Test 1 PASSED');
    console.log('Uploaded URL:', url1);
  } catch (error) {
    console.error('❌ Test 1 FAILED');
    console.error('Error:', error.message);
  }

  // Test 2: Upload with data buffer
  console.log('\n📝 Test 2: Upload with data buffer');
  console.log('-'.repeat(50));
  
  try {
    const testBuffer = Buffer.from('fake image data for testing');
    const testMediaWithBuffer = {
      data: testBuffer,
      mimeType: 'image/jpeg',
      fileName: 'test_photo_buffer.jpg'
    };

    console.log('Media object: { data: Buffer, mimeType, fileName }');
    console.log('Buffer size:', testBuffer.length, 'bytes');
    console.log('\n⏳ Uploading...');
    
    const url2 = await uploadProofToBlob('test-user-456', testMediaWithBuffer);
    
    console.log('✅ Test 2 PASSED');
    console.log('Uploaded URL:', url2);
  } catch (error) {
    console.error('❌ Test 2 FAILED');
    console.error('Error:', error.message);
  }

  // Test 3: Invalid media object (should fail gracefully)
  console.log('\n📝 Test 3: Invalid media object (should fail)');
  console.log('-'.repeat(50));
  
  try {
    const invalidMedia = {
      fileName: 'test.jpg'
      // Missing both fileUrl and data
    };

    console.log('Media object:', invalidMedia);
    console.log('\n⏳ Uploading...');
    
    await uploadProofToBlob('test-user-789', invalidMedia);
    
    console.error('❌ Test 3 FAILED - Should have thrown error');
  } catch (error) {
    console.log('✅ Test 3 PASSED - Error caught as expected');
    console.log('Error message:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🏁 Testing Complete\n');
}

// Run tests
testPhotoUpload().catch(error => {
  console.error('\n💥 Fatal error during testing:', error);
  process.exit(1);
});
