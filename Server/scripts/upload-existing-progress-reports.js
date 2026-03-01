/**
 * Script to upload existing progress reports to Azure Blob Storage
 * Organizes reports by department ID and saves URLs to database
 */

import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../src/config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reportsDir = path.join(__dirname, '../../Agents/ProgressTrackingAgent/reports');
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'igrs';
const reportsBlobFolder = 'progress-reports';

async function uploadExistingReports() {
  try {
    console.log('\n📤 Starting upload of existing progress reports...\n');

    if (!connectionString) {
      console.error('❌ Azure Storage connection string not configured');
      process.exit(1);
    }

    // Check if reports directory exists
    if (!fs.existsSync(reportsDir)) {
      console.error(`❌ Reports directory not found: ${reportsDir}`);
      process.exit(1);
    }

    // Get all markdown files
    const files = fs.readdirSync(reportsDir)
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        name: file,
        path: path.join(reportsDir, file),
        stats: fs.statSync(path.join(reportsDir, file))
      }));

    if (files.length === 0) {
      console.log('⚠️  No markdown reports found');
      process.exit(0);
    }

    console.log(`📄 Found ${files.length} report file(s)\n`);

    // Initialize Azure Blob Service Client
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Ensure container exists
    await containerClient.createIfNotExists();
    console.log(`✅ Container "${containerName}" ready\n`);

    let uploadedCount = 0;
    let skippedCount = 0;

    for (const file of files) {
      try {
        console.log(`\n📝 Processing: ${file.name}`);

        // Extract department name from filename
        // Format: department_Water_Supply_Department_20260301_040940.md
        const match = file.name.match(/department_(.+)_(\d{8})_(\d{6})\.md/);
        
        if (!match) {
          console.log(`⚠️  Skipping - doesn't match expected format`);
          skippedCount++;
          continue;
        }

        const departmentName = match[1].replace(/_/g, ' ');
        const dateStr = match[2]; // YYYYMMDD
        const timeStr = match[3]; // HHMMSS

        console.log(`   Department: ${departmentName}`);
        console.log(`   Date: ${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`);
        console.log(`   Time: ${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}`);

        // Get department ID from database
        const deptResult = await pool.query(
          'SELECT id FROM departments WHERE name = $1',
          [departmentName]
        );

        if (deptResult.rows.length === 0) {
          console.log(`   ⚠️  Department not found in database`);
          skippedCount++;
          continue;
        }

        const departmentId = deptResult.rows[0].id;
        console.log(`   Department ID: ${departmentId}`);

        // Create blob path: progress-reports/{departmentId}/{filename}
        const blobName = `${reportsBlobFolder}/${departmentId}/${file.name}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Check if blob already exists
        const exists = await blockBlobClient.exists();
        if (exists) {
          console.log(`   ℹ️  Already exists in blob storage, skipping upload`);
        } else {
          // Read file content
          const fileContent = fs.readFileSync(file.path, 'utf-8');

          // Upload to blob
          await blockBlobClient.upload(fileContent, Buffer.byteLength(fileContent), {
            blobHTTPHeaders: {
              blobContentType: 'text/markdown'
            },
            metadata: {
              uploadedAt: new Date().toISOString(),
              source: 'progress-tracking-agent',
              departmentId: departmentId,
              departmentName: departmentName,
              reportDate: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`,
              reportTime: `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}`
            }
          });

          console.log(`   ✅ Uploaded to: ${blobName}`);
        }

        const blobUrl = blockBlobClient.url;

        // Save URL to database in department_dashboards table
        await pool.query(
          `INSERT INTO department_dashboards (department_id, dashboard_data, created_at, updated_at)
           VALUES ($1, $2, NOW(), NOW())
           ON CONFLICT (department_id)
           DO UPDATE SET 
             dashboard_data = jsonb_set(
               COALESCE(department_dashboards.dashboard_data, '{}'::jsonb),
               '{progressReports}',
               COALESCE(department_dashboards.dashboard_data->'progressReports', '[]'::jsonb) || $2::jsonb->'progressReports'
             ),
             updated_at = NOW()`,
          [
            departmentId,
            JSON.stringify({
              progressReports: [{
                url: blobUrl,
                fileName: file.name,
                uploadedAt: new Date().toISOString(),
                reportDate: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`,
                reportTime: `${timeStr.slice(0, 2)}:${timeStr.slice(2, 4)}:${timeStr.slice(4, 6)}`,
                departmentName: departmentName
              }]
            })
          ]
        );

        console.log(`   💾 Saved URL to database`);
        uploadedCount++;

      } catch (error) {
        console.error(`   ❌ Error processing ${file.name}:`, error.message);
        skippedCount++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Upload complete!`);
    console.log(`   Uploaded: ${uploadedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Total: ${files.length}`);
    console.log(`${'='.repeat(60)}\n`);

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    await pool.end();
    process.exit(1);
  }
}

// Run the script
uploadExistingReports();
