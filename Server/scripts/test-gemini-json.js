import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function testGeminiJSON() {
  console.log('\n🧪 Testing Gemini JSON Extraction...\n');

  const prompt = `You are a helpful assistant. Analyze this message: "I am a contractor"

Return ONLY valid JSON:
{
  "user_type": "contractor",
  "confidence": 0.95
}

CRITICAL: You MUST respond with ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Just the raw JSON object.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;
    console.log('📝 Raw Gemini Response:');
    console.log('─'.repeat(80));
    console.log(text);
    console.log('─'.repeat(80));

    // Try to extract JSON
    let cleanText = text.trim();
    
    // Try to extract JSON from markdown code blocks
    const jsonMatch = cleanText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      console.log('\n✅ Found JSON in markdown code block');
      cleanText = jsonMatch[1].trim();
    } else {
      // Try generic code blocks
      const codeMatch = cleanText.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        console.log('\n✅ Found JSON in generic code block');
        cleanText = codeMatch[1].trim();
      } else {
        console.log('\n⚠️  No code blocks found, using raw text');
      }
    }
    
    // Remove any leading/trailing backticks
    cleanText = cleanText.replace(/^`+|`+$/g, '');
    
    console.log('\n🧹 Cleaned Text:');
    console.log('─'.repeat(80));
    console.log(cleanText);
    console.log('─'.repeat(80));

    // Parse JSON
    const parsed = JSON.parse(cleanText);
    console.log('\n✅ Successfully parsed JSON:');
    console.log(JSON.stringify(parsed, null, 2));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testGeminiJSON();
