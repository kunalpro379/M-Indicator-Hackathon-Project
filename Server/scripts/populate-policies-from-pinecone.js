import { Pinecone } from '@pinecone-database/pinecone';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from Server directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Department keywords for matching content
const DEPARTMENT_KEYWORDS = {
  'Public Works Department': ['road', 'construction', 'infrastructure', 'highway', 'bridge', 'pavement', 'public works'],
  'Water Supply Department': ['water', 'supply', 'pipeline', 'jal', 'drinking water', 'water distribution'],
  'Water Supply and Sanitation Department': ['water', 'sanitation', 'sewage', 'drainage', 'wastewater', 'treatment'],
  'Sanitation Department': ['sanitation', 'waste', 'garbage', 'cleanliness', 'swachh', 'solid waste', 'disposal'],
  'Electrical Department': ['electrical', 'electricity', 'power', 'lighting', 'street light', 'led', 'transformer'],
  'Health Department': ['health', 'medical', 'hospital', 'clinic', 'disease', 'vaccination', 'healthcare'],
  'Parks and Gardens': ['park', 'garden', 'green', 'tree', 'landscaping', 'horticulture', 'plantation'],
  'Roads Department': ['road', 'highway', 'street', 'traffic', 'pothole', 'road maintenance', 'asphalt'],
  'Garbage Management': ['garbage', 'waste', 'trash', 'collection', 'disposal', 'recycling', 'waste management'],
  'Education Department': ['education', 'school', 'student', 'teacher', 'learning', 'educational']
};

async function fetchAllVectorsFromPinecone() {
  console.log('\n' + '='.repeat(80));
  console.log('FETCHING ALL VECTORS FROM PINECONE');
  console.log('='.repeat(80));
  
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pinecone.index(process.env.PINECONE_INDEX_NAME);
  
  // Get index stats
  console.log('\n📊 Checking index stats...');
  const stats = await index.describeIndexStats();
  console.log(`   Total vectors: ${stats.totalRecordCount || 0}`);
  console.log(`   Dimension: ${stats.dimension || 0}`);
  console.log(`   Namespaces:`, Object.keys(stats.namespaces || {}));
  
  const allVectors = [];
  const dimension = stats.dimension || 384;
  
  // Strategy: Query with multiple random vectors to get diverse results
  console.log('\n📥 Fetching vectors using query strategy...');
  
  try {
    // Generate multiple random vectors and query
    const numQueries = 10; // Query 10 times to get diverse results
    const topK = 50; // Get top 50 per query
    
    for (let i = 0; i < numQueries; i++) {
      console.log(`   Query ${i + 1}/${numQueries}...`);
      
      // Create a random vector
      const randomVector = Array.from({ length: dimension }, () => Math.random() * 2 - 1);
      
      const queryResult = await index.query({
        vector: randomVector,
        topK: topK,
        includeMetadata: true
      });
      
      if (queryResult.matches && queryResult.matches.length > 0) {
        console.log(`      Found ${queryResult.matches.length} vectors`);
        
        queryResult.matches.forEach(match => {
          // Check if we already have this vector
          if (!allVectors.find(v => v.id === match.id)) {
            allVectors.push({
              id: match.id,
              metadata: match.metadata || {},
              score: match.score
            });
          }
        });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
  } catch (error) {
    console.error('   ❌ Error querying vectors:', error.message);
  }
  
  console.log(`\n✅ Total unique vectors fetched: ${allVectors.length}`);
  
  // Show sample of what we got
  if (allVectors.length > 0) {
    console.log('\n📄 Sample vector metadata:');
    const sample = allVectors[0];
    console.log(`   ID: ${sample.id}`);
    console.log(`   Metadata keys:`, Object.keys(sample.metadata));
    if (sample.metadata.text) {
      console.log(`   Text preview: ${sample.metadata.text.substring(0, 100)}...`);
    }
  }
  
  return allVectors;
}

function matchVectorToDepartment(vector) {
  const metadata = vector.metadata || {};
  const text = (metadata.text || metadata.content || metadata.description || '').toLowerCase();
  const fileName = (metadata.file_name || metadata.document_name || '').toLowerCase();
  const allText = `${text} ${fileName}`;
  
  const matches = [];
  
  for (const [deptName, keywords] of Object.entries(DEPARTMENT_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (allText.includes(keyword.toLowerCase())) {
        score++;
      }
    }
    if (score > 0) {
      matches.push({ department: deptName, score, text: metadata.text || metadata.content || metadata.description || '' });
    }
  }
  
  // Sort by score and return best match
  matches.sort((a, b) => b.score - a.score);
  return matches;
}

function convertToMarkdown(departmentName, contents) {
  if (!contents || contents.length === 0) {
    return generateDefaultPolicy(departmentName);
  }
  
  let markdown = `# ${departmentName} - Policies and Guidelines\n\n`;
  markdown += `## Overview\n\n`;
  markdown += `This document contains policies, guidelines, and relevant information for ${departmentName}.\n\n`;
  markdown += `*Generated from knowledge base on ${new Date().toLocaleDateString('en-IN')}*\n\n`;
  markdown += `---\n\n`;
  
  // Add content sections
  markdown += `## Relevant Information\n\n`;
  
  contents.forEach((content, idx) => {
    if (content.text && content.text.trim()) {
      markdown += `### Section ${idx + 1}\n\n`;
      
      // Split into paragraphs
      const paragraphs = content.text.split('\n').filter(p => p.trim());
      paragraphs.forEach(para => {
        markdown += `${para.trim()}\n\n`;
      });
      
      markdown += `*Relevance Score: ${content.score}*\n\n`;
      markdown += `---\n\n`;
    }
  });
  
  // Add standard sections
  markdown += `## Operational Guidelines\n\n`;
  markdown += `- Follow all government regulations and circulars\n`;
  markdown += `- Maintain proper documentation for all activities\n`;
  markdown += `- Ensure timely response to citizen grievances\n`;
  markdown += `- Regular reporting and monitoring\n\n`;
  
  markdown += `## Compliance and Monitoring\n\n`;
  markdown += `- All policies must be followed strictly\n`;
  markdown += `- Regular audits will be conducted\n`;
  markdown += `- Non-compliance may result in disciplinary action\n`;
  markdown += `- Grievances related to policy violations should be reported immediately\n\n`;
  
  markdown += `---\n\n`;
  markdown += `*Last Updated: ${new Date().toLocaleDateString('en-IN')}*\n`;
  
  return markdown;
}

function generateDefaultPolicy(departmentName) {
  return `# ${departmentName} - Policies and Guidelines

## Overview
This document outlines the standard operating procedures and guidelines for ${departmentName}.

## Core Responsibilities
- Efficient handling of citizen grievances
- Timely completion of assigned tasks
- Maintaining quality standards in all operations
- Regular reporting and documentation
- Coordination with other departments

## Service Delivery Standards
- Response time: Within 24 hours for urgent matters
- Resolution time: As per SLA guidelines
- Quality assurance: Regular inspections and audits
- Citizen satisfaction: Minimum 80% satisfaction rate

## Operational Guidelines
- Follow all government regulations and circulars
- Maintain proper documentation for all activities
- Use approved vendors and contractors
- Ensure safety protocols are followed
- Regular training and skill development

## Grievance Handling
- Acknowledge all grievances within 24 hours
- Assign to appropriate officer/team
- Regular status updates to citizens
- Escalate unresolved issues as per protocol
- Maintain grievance records

## Quality Control
- Regular inspections of completed work
- Citizen feedback collection
- Performance monitoring and reporting
- Continuous improvement initiatives

## Compliance and Monitoring
- All policies must be followed strictly
- Regular audits will be conducted
- Non-compliance may result in disciplinary action
- Grievances related to policy violations should be reported immediately

---

*Last Updated: ${new Date().toLocaleDateString('en-IN')}*
`;
}

async function populatePolicies() {
  const client = await pool.connect();
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('POPULATING DEPARTMENT POLICIES FROM PINECONE');
    console.log('='.repeat(80));
    
    // Fetch all vectors from Pinecone
    const vectors = await fetchAllVectorsFromPinecone();
    
    if (vectors.length === 0) {
      console.log('\n⚠️  No vectors found in Pinecone. Using default policies.');
    }
    
    // Get all departments
    const deptResult = await client.query(`
      SELECT id, name FROM departments ORDER BY name
    `);
    
    console.log(`\n📋 Found ${deptResult.rows.length} departments to process\n`);
    
    // Match vectors to departments
    const departmentContent = {};
    
    console.log('🔍 Matching vectors to departments...\n');
    vectors.forEach(vector => {
      const matches = matchVectorToDepartment(vector);
      matches.forEach(match => {
        if (!departmentContent[match.department]) {
          departmentContent[match.department] = [];
        }
        departmentContent[match.department].push({
          text: match.text,
          score: match.score
        });
      });
    });
    
    // Show matching summary
    for (const [dept, contents] of Object.entries(departmentContent)) {
      console.log(`   ${dept}: ${contents.length} relevant items`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('UPDATING DEPARTMENTS');
    console.log('='.repeat(80) + '\n');
    
    let successCount = 0;
    
    for (const dept of deptResult.rows) {
      console.log(`📝 Processing: ${dept.name}`);
      
      const contents = departmentContent[dept.name] || [];
      console.log(`   Found ${contents.length} relevant items`);
      
      // Sort by score and take top 10
      contents.sort((a, b) => b.score - a.score);
      const topContents = contents.slice(0, 10);
      
      // Convert to markdown
      const markdown = convertToMarkdown(dept.name, topContents);
      
      // Update database
      await client.query(`
        UPDATE departments
        SET policies = $1, updated_at = NOW()
        WHERE id = $2
      `, [markdown, dept.id]);
      
      console.log(`   ✅ Updated (${markdown.length} characters)`);
      console.log(`   Preview: ${markdown.substring(0, 100)}...\n`);
      
      successCount++;
    }
    
    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully updated: ${successCount}/${deptResult.rows.length} departments`);
    console.log(`📊 Total vectors processed: ${vectors.length}`);
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
populatePolicies()
  .then(() => {
    console.log('\n✅ Policy population completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
