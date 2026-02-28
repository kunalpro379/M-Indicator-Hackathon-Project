# Field Worker Conversational Workflow

## Overview
The field worker bot now uses a purely conversational approach - asking questions one by one instead of trying to extract information automatically.

## How It Works

### 1. Question Flow
The bot asks questions in this order:
1. **Description**: "What work did you do today?"
2. **Site**: "Which site or location did you work at?"
3. **Hours**: "How many hours did you work?"
4. **Proof**: "Please send a photo of your completed work"

### 2. State Tracking
- Each conversation has a `currentQuestion` field that tracks which question we're on
- Answers are stored directly without AI extraction
- State is saved after each answer

### 3. Image Analysis
When a field worker sends an image:
- If description is missing, AI analyzes the image to extract what work was done
- The image is stored as proof
- If other fields are still missing, bot asks for them
- Once all fields are collected, the report is submitted

### 4. No Automatic Extraction
- Bot does NOT try to extract multiple fields from one message
- Bot does NOT guess or infer information
- Each answer is taken literally and stored directly

## Example Conversation

```
Bot: Hi! Ready to submit your daily work report?
     Let's start: What work did you do today?

User: Fixed water pipes

Bot: Got it! 📝
     Work: Fixed water pipes
     Which site or location did you work at?

User: Kansai section ambernath east

Bot: Perfect! 📍
     Site: Kansai section ambernath east
     How many hours did you work? (Just send the number)

User: 8

Bot: Excellent! ⏰
     Hours: 8
     Now please send a photo of your completed work as proof. 📸

User: [sends photo]

Bot: ✅ Report submitted successfully!
     📊 Productivity Score: 8.5/10
     🤖 AI Analysis: Field worker completed pipe repair work...
     Great work today! 💪
```

## Key Changes

### Before (Automatic Extraction)
- Bot tried to extract all fields from any message
- Used AI to parse and understand context
- Could extract multiple fields at once
- Sometimes guessed information

### After (Conversational)
- Bot asks one question at a time
- Takes answers literally
- No guessing or inference
- Simple, predictable flow

## Technical Details

### State Structure
```javascript
{
  userId: "user-id",
  date: "2026-03-01",
  report: {
    description: null,  // Filled from user answer
    site: null,         // Filled from user answer
    hours: null,        // Extracted number from answer
    blockers: null      // Optional
  },
  proofs: [],           // Array of image URLs
  missingFields: ['description', 'site', 'hours'],
  currentQuestion: 'description',  // Tracks which question we're on
  status: 'collecting'  // or 'complete'
}
```

### Files Modified
1. `Server/src/services/agent.service.js`
   - Updated `fieldWorkerWorkflow()` to use conversational approach
   - Added `analyzeImageContent()` delegation

2. `Server/src/services/agent.helpers.js`
   - Fixed JSON parsing for JSONB columns (check if already object)
   - Added `currentQuestion` to initial state
   - Added `analyzeImageContent()` function for image analysis

## Benefits
- More predictable user experience
- Easier to debug and maintain
- No confusion from AI misunderstanding
- Clear step-by-step process
- Still uses AI for image analysis when helpful
