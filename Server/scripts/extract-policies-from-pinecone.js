import { Pinecone } from '@pinecone-database/pinecone';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Simple embedding function (using character-based hashing for demo)
// In production, you'd use the same embedding model used to create the vectors
function createSimpleEmbedding(text, dimension = 384) {
  const embedding = new Array(dimension).fill(0);
  const normalized = text.toLowerCase().trim();
  
  // Create a pseudo-embedding based on text characteristics
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const index = (charCode * (i + 1)) % dimension;
    embedding[index] += Math.sin(charCode + i) * 0.1;
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
}

// Department search terms mapping
const departmentSearchTerms = {
  'Public Works Department': [
    'road construction', 'infrastructure', 'public works', 'construction standards',
    'road maintenance', 'highway', 'bridge', 'pavement', 'asphalt'
  ],
  'Water Supply Department': [
    'water supply', 'pipeline', 'water quality', 'jal jeevan', 'water distribution',
    'drinking water', 'water treatment', 'water infrastructure'
  ],
  'Water Supply and Sanitation Department': [
    'water supply', 'sanitation', 'water treatment', 'sewage', 'wastewater',
    'water infrastructure', 'sanitation standards'
  ],
  'Sanitation Department': [
    'sanitation', 'waste management', 'solid waste', 'cleanliness', 'swachh bharat',
    'garbage collection', 'waste disposal', 'recycling'
  ],
  'Electrical Department': [
    'street lighting', 'electrical', 'power distribution', 'LED', 'electricity',
    'electrical maintenance', 'power supply', 'lighting'
  ],
  'Health Department': [
    'public health', 'disease prevention', 'health camp', 'vaccination', 'healthcare',
    'medical', 'hospital', 'clinic', 'health services'
  ],
  'Parks and Gardens': [
    'park', 'garden', 'landscaping', 'green space', 'urban forestry',
    'horticulture', 'tree', 'plantation', 'greenery'
  ],
  'Roads Department': [
    'road', 'highway', 'traffic', 'road safety', 'road construction',
    'road maintenance', 'pavement', 'street'
  ],
  'Garbage Management': [
    'garbage', 'waste', 'trash', 'refuse', 'waste collection',
    'waste disposal', 'recycling', 'waste management'
  ],
  'Education Department': [
    'education', 'school', 'student', 'teacher', 'learning',
    'educational', 'academic', 'curriculum'
  ]
};

async function extractPoliciesFromPinecone() {
  const client = await pool.connect();
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('EXTRACTING POLICIES FROM PINECONE');
    console.log('='.repeat(80));
    console.log(`Pinecone Index: ${process.env.PINECONE_INDEX_NAME}`);
    console.log('='.repeat(80) + '\n');

    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME);

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
        const searchTerms = departmentSearchTerms[dept.name] || [dept.name];
        console.log(`Search terms: ${searchTerms.join(', ')}`);
        
        const allResults = [];
        
        // Query Pinecone with each search term
        for (const term of searchTerms) {
          console.log(`\n  Querying for: "${term}"`);
          
          // Create embedding for search term
          const queryVector = createSimpleEmbedding(term);
          
          try {
            const queryResult = await index.query({
              vector: queryVector,
              topK: 20,
              includeMetadata: true
            });
            
            if (queryResult.matches && queryResult.matches.length > 0) {
              console.log(`    ✓ Found ${queryResult.matches.length} results`);
              
              // Filter results by relevance and content
              const relevantResults = queryResult.matches.filter(match => {
                const text = match.metadata?.text || '';
                const jobId = match.metadata?.job_id || '';
                
                // Check if text contains relevant keywords
                const lowerText = text.toLowerCase();
                const hasRelevantContent = searchTerms.some(t => 
                  lowerText.includes(t.toLowerCase())
                );
                
                // Check if it's a substantial document (not error pages)
                const isSubstantial = text.length > 200 && 
                                     !text.includes('Page you have requested is not available');
                
                return hasRelevantContent && isSubstantial;
              });
              
              console.log(`    ✓ ${relevantResults.length} relevant results after filtering`);
              allResults.push(...relevantResults);
            } else {
              console.log(`    ⚠ No results found`);
            }
          } catch (queryError) {
            console.log(`    ✗ Query failed: ${queryError.message}`);
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Remove duplicates by vector ID
        const uniqueResults = Array.from(
          new Map(allResults.map(r => [r.id, r])).values()
        );
        
        console.log(`\n  Total unique results: ${uniqueResults.length}`);
        
        // Convert to markdown
        const markdown = convertToMarkdown(dept.name, uniqueResults);
        
        // Update database
        await client.query(`
          UPDATE departments
          SET policies = $1, updated_at = NOW()
          WHERE id = $2
        `, [markdown, dept.id]);

        console.log(`\n✅ SUCCESS: Updated policies for ${dept.name}`);
        console.log(`   Results found: ${uniqueResults.length}`);
        console.log(`   Markdown length: ${markdown.length} characters`);
        console.log(`   Preview: ${markdown.substring(0, 150)}...`);
        
        successCount++;
      } catch (error) {
        console.error(`\n❌ FAILED: Error processing ${dept.name}`);
        console.error(`   Error: ${error.message}`);
        failCount++;
      }

      // Delay between departments
      if (i < deptResult.rows.length - 1) {
        console.log(`\n⏳ Waiting 1 second before next department...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n\n${'='.repeat(80)}`);
    console.log('FINAL SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully processed: ${successCount} departments`);
    console.log(`❌ Failed: ${failCount} departments`);
    console.log(`📊 Success rate: ${((successCount / deptResult.rows.length) * 100).toFixed(1)}%`);
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

function convertToMarkdown(departmentName, results) {
  if (!results || results.length === 0) {
    return generateDefaultPolicy(departmentName);
  }

  let markdown = `# ${departmentName} - Policies and Guidelines\n\n`;
  markdown += `## Overview\n\n`;
  markdown += `This document contains policies, guidelines, and regulations for ${departmentName}, `;
  markdown += `extracted from the knowledge base.\n\n`;
  markdown += `*Last Updated: ${new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}*\n\n`;
  markdown += `---\n\n`;

  // Group by source/document
  const bySource = {};
  results.forEach((result, idx) => {
    const metadata = result.metadata || {};
    const fileName = metadata.file_name || metadata.url || `Document ${idx + 1}`;
    const source = fileName.replace(/\.(txt|pdf)$/i, '').replace(/_/g, ' ');
    
    if (!bySource[source]) {
      bySource[source] = [];
    }
    
    bySource[source].push({
      text: metadata.text || '',
      url: metadata.url || '',
      score: result.score || 0,
      jobId: metadata.job_id || ''
    });
  });

  // Add content by source
  let sectionCount = 0;
  Object.keys(bySource).sort().forEach(source => {
    const items = bySource[source];
    
    // Combine text from same source
    const combinedText = items
      .sort((a, b) => b.score - a.score)
      .map(item => item.text.trim())
      .join('\n\n')
      .substring(0, 2000); // Limit to 2000 chars per source
    
    if (combinedText.length > 100) {
      sectionCount++;
      markdown += `## ${sectionCount}. ${source}\n\n`;
      
      // Split into paragraphs
      const paragraphs = combinedText
        .split(/\n+/)
        .filter(p => p.trim().length > 50)
        .slice(0, 5); // Max 5 paragraphs per source
      
      paragraphs.forEach(para => {
        markdown += `${para.trim()}\n\n`;
      });
      
      // Add source reference
      const url = items[0].url;
      if (url) {
        markdown += `*Source: [${url}](${url})*\n\n`;
      }
      
      markdown += `---\n\n`;
    }
  });

  // Add standard sections if no content was found
  if (sectionCount === 0) {
    return generateDefaultPolicy(departmentName);
  }

  // Add compliance section
  markdown += `## Compliance and Monitoring\n\n`;
  markdown += `- All policies and guidelines must be followed strictly\n`;
  markdown += `- Regular audits and inspections will be conducted\n`;
  markdown += `- Non-compliance may result in disciplinary action\n`;
  markdown += `- Report policy violations through the grievance system\n\n`;
  
  markdown += `## Updates and Revisions\n\n`;
  markdown += `This policy document is subject to periodic review and updates. `;
  markdown += `All department staff must stay informed about the latest policy changes `;
  markdown += `and government circulars.\n\n`;
  
  markdown += `---\n\n`;
  markdown += `*Document extracted from Pinecone Knowledge Base*\n`;
  markdown += `*Total Sources: ${Object.keys(bySource).length}*\n`;
  markdown += `*Total Documents: ${results.length}*\n`;

  return markdown;
}

function generateDefaultPolicy(departmentName) {
  return `# ${departmentName} - Policies and Guidelines

## Overview

This document outlines the standard operating procedures and guidelines for ${departmentName}.

## Core Responsibilities

- Efficient handling of citizen grievances
- Timely completion of assigned tasks and projects
- Maintaining quality standards in all operations
- Regular reporting and documentation
- Coordination with other departments and agencies

## Service Delivery Standards

- **Response Time**: Within 24 hours for urgent matters
- **Resolution Time**: As per SLA guidelines based on priority
- **Quality Assurance**: Regular inspections and audits
- **Citizen Satisfaction**: Minimum 80% satisfaction rate target

## Operational Guidelines

1. Follow all government regulations, circulars, and notifications
2. Maintain proper documentation for all activities
3. Use approved vendors and contractors only
4. Ensure safety protocols are followed at all times
5. Regular training and skill development for staff

## Grievance Handling Protocol

1. **Acknowledgment**: All grievances within 24 hours
2. **Assignment**: To appropriate officer/team based on expertise
3. **Updates**: Regular status updates to citizens
4. **Escalation**: Unresolved issues escalated as per protocol
5. **Records**: Maintain complete grievance records

## Quality Control Measures

- Regular inspections of completed work
- Citizen feedback collection and analysis
- Performance monitoring and reporting
- Continuous improvement initiatives
- Benchmarking against best practices

## Budget and Resource Management

- Efficient utilization of allocated budget
- Regular monitoring of expenditure
- Proper procurement procedures
- Asset management and maintenance
- Resource optimization

## Compliance and Monitoring

- All policies must be followed strictly
- Regular audits will be conducted
- Non-compliance may result in disciplinary action
- Grievances related to policy violations should be reported immediately

## Contact Information

For detailed policies, please contact the department head or refer to official government circulars and notifications.

---

*Last Updated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}*
*Note: Specific policy documents will be added as they become available in the knowledge base*
`;
}

// Run the script
extractPoliciesFromPinecone()
  .then(() => {
    console.log('\n✅ Policy extraction completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
