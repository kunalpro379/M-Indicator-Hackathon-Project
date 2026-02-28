# Field Worker Progress Tracking with AI Analysis 🤖📊

## Overview

Complete system for tracking field worker daily progress with AI-powered analysis, visible in the admin panel.

## Features

✅ **AI-Powered Analysis** - Gemini AI analyzes every report
✅ **Structured Data Extraction** - Tasks, materials, issues automatically extracted
✅ **Sentiment Analysis** - Positive, neutral, or negative sentiment detection
✅ **Quality Scoring** - AI rates report quality (0-10)
✅ **Chat History** - Full conversation logs with field workers
✅ **Admin Dashboard** - View all reports with AI insights
✅ **Review System** - Approve/reject reports with notes

## Database Schema

### daily_reports Table (Enhanced)
```sql
- id (UUID)
- user_id (UUID) - Field worker
- date (DATE)
- description (TEXT) - Work description
- site (VARCHAR) - Location
- hours (NUMERIC) - Hours worked
- blockers (TEXT) - Issues faced
- proof_urls (TEXT[]) - Photo URLs
- productivity_score (NUMERIC) - 0-10
- proof_verified (BOOLEAN)

-- AI Analysis Fields
- ai_summary (TEXT) - AI-generated summary
- ai_analysis (JSONB) - Full AI analysis
- sentiment (VARCHAR) - positive/neutral/negative
- quality_score (NUMERIC) - 0-10
- tasks_completed (TEXT[]) - Extracted tasks
- materials_used (TEXT[]) - Extracted materials
- issues_found (TEXT[]) - Extracted issues

-- Review Fields
- status (VARCHAR) - submitted/approved/rejected
- reviewed_by (UUID)
- reviewed_at (TIMESTAMP)
- reviewer_notes (TEXT)

-- Metadata
- channel (VARCHAR) - telegram/whatsapp
- message_id (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Workflow

### 1. Field Worker Submits Report (Telegram/WhatsApp)

```
Worker: Completed road repair work at MG Road
Bot: Great! How many hours did you work?

Worker: 6 hours
Bot: Any challenges or blockers?

Worker: None
Bot: Please send a photo of your completed work 📸

Worker: [sends photo]
Bot: ✅ Report submitted successfully!
     📊 Productivity Score: 8.5/10
     🤖 AI Analysis: Worker completed road repair efficiently with proper materials and documentation.
     
     Great work today! 💪
```

### 2. AI Analysis Process

When report is submitted:

1. **Extract structured data** from conversation
2. **Analyze with Gemini AI**:
   - Generate summary
   - Detect sentiment
   - Rate quality
   - Extract tasks, materials, issues
   - Provide recommendations

3. **Store in database** with all AI insights

### 3. Admin Panel View

Department officers see a table with:

| Worker | Date | Site | Hours | Score | Quality | Sentiment | Status | Actions |
|--------|------|------|-------|-------|---------|-----------|--------|---------|
| John Doe | 2026-03-01 | MG Road | 6 | 8.5 | 9.0 | ✅ Positive | Submitted | View/Review |
| Jane Smith | 2026-03-01 | Station Rd | 8 | 7.2 | 7.5 | ⚠️ Neutral | Submitted | View/Review |

## API Endpoints

### Get All Reports
```http
GET /api/field-worker-progress/reports
Authorization: Bearer <token>

Query Parameters:
- department_id (optional)
- status (optional): submitted/approved/rejected
- date_from (optional): YYYY-MM-DD
- date_to (optional): YYYY-MM-DD
- user_id (optional): specific worker

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "worker_name": "John Doe",
      "worker_phone": "918779017300",
      "department_name": "Roads Department",
      "date": "2026-03-01",
      "description": "Completed road repair...",
      "site": "MG Road",
      "hours": 6,
      "productivity_score": 8.5,
      "quality_score": 9.0,
      "sentiment": "positive",
      "ai_summary": "Worker completed road repair efficiently...",
      "tasks_completed": ["Road repair", "Pothole filling"],
      "materials_used": ["Asphalt", "Cement"],
      "issues_found": [],
      "status": "submitted",
      "created_at": "2026-03-01T10:30:00Z"
    }
  ]
}
```

### Get Single Report with Chat History
```http
GET /api/field-worker-progress/reports/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "report": {
      // Full report details
      "ai_analysis": {
        "summary": "...",
        "sentiment": "positive",
        "quality_score": 9.0,
        "tasks_completed": [...],
        "materials_used": [...],
        "issues_found": [...],
        "recommendations": "..."
      }
    },
    "chat_history": [
      {
        "message": "Completed road repair work",
        "is_bot": false,
        "created_at": "2026-03-01T10:00:00Z"
      },
      {
        "message": "Great! How many hours did you work?",
        "is_bot": true,
        "created_at": "2026-03-01T10:00:05Z"
      }
    ]
  }
}
```

### Get Statistics
```http
GET /api/field-worker-progress/stats
Authorization: Bearer <token>

Query Parameters:
- department_id (optional)
- date_from (optional)
- date_to (optional)

Response:
{
  "success": true,
  "data": {
    "total_reports": 150,
    "active_workers": 25,
    "avg_productivity": 7.8,
    "avg_quality": 8.2,
    "avg_hours": 6.5,
    "positive_reports": 120,
    "neutral_reports": 25,
    "negative_reports": 5,
    "pending_review": 30,
    "approved_reports": 120
  }
}
```

### Review Report
```http
POST /api/field-worker-progress/reports/:id/review
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "status": "approved", // or "rejected"
  "notes": "Good work, keep it up!"
}

Response:
{
  "success": true,
  "message": "Report approved",
  "data": {
    // Updated report
  }
}
```

## AI Analysis Example

### Input (Worker's Report)
```
Description: "Completed pothole repair on MG Road near station. Used 2 bags of asphalt mix and compacted properly. Traffic was heavy so work took longer than expected."
Site: "MG Road"
Hours: 6
Blockers: "Heavy traffic"
```

### AI Analysis Output
```json
{
  "summary": "Worker successfully completed pothole repair on MG Road using proper materials and techniques. Work quality appears good despite traffic challenges.",
  "sentiment": "positive",
  "quality_score": 8.5,
  "tasks_completed": [
    "Pothole repair",
    "Asphalt application",
    "Compaction"
  ],
  "materials_used": [
    "Asphalt mix (2 bags)"
  ],
  "issues_found": [
    "Heavy traffic causing delays"
  ],
  "recommendations": "Consider scheduling similar work during off-peak hours to improve efficiency."
}
```

## Frontend Integration (IGRS Portal)

### Field Worker Progress Table Component

```jsx
// Example React component
import { useState, useEffect } from 'react';

function FieldWorkerProgressTable() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Fetch reports
    fetch('/api/field-worker-progress/reports', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setReports(data.data));

    // Fetch stats
    fetch('/api/field-worker-progress/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data.data));
  }, []);

  return (
    <div>
      <h2>Field Worker Progress</h2>
      
      {/* Statistics Cards */}
      <div className="stats">
        <div>Total Reports: {stats.total_reports}</div>
        <div>Active Workers: {stats.active_workers}</div>
        <div>Avg Productivity: {stats.avg_productivity?.toFixed(1)}/10</div>
        <div>Avg Quality: {stats.avg_quality?.toFixed(1)}/10</div>
      </div>

      {/* Reports Table */}
      <table>
        <thead>
          <tr>
            <th>Worker</th>
            <th>Date</th>
            <th>Site</th>
            <th>Hours</th>
            <th>Productivity</th>
            <th>Quality</th>
            <th>Sentiment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map(report => (
            <tr key={report.id}>
              <td>{report.worker_name}</td>
              <td>{report.date}</td>
              <td>{report.site}</td>
              <td>{report.hours}</td>
              <td>{report.productivity_score?.toFixed(1)}</td>
              <td>{report.quality_score?.toFixed(1)}</td>
              <td>
                {report.sentiment === 'positive' && '✅'}
                {report.sentiment === 'neutral' && '⚠️'}
                {report.sentiment === 'negative' && '❌'}
              </td>
              <td>{report.status}</td>
              <td>
                <button onClick={() => viewDetails(report.id)}>View</button>
                <button onClick={() => reviewReport(report.id)}>Review</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Report Details Modal

Shows:
- Full report details
- AI analysis and insights
- Chat history with worker
- Review form

## Testing

### 1. Submit Report via Telegram
```
1. Message bot: "Completed road repair"
2. Bot asks for details
3. Provide: site, hours, blockers
4. Upload photo
5. Bot confirms with AI analysis
```

### 2. Check Admin Panel
```
1. Login to IGRS Portal
2. Navigate to Field Worker Progress
3. See report in table with AI insights
4. Click "View" to see full details and chat
5. Click "Review" to approve/reject
```

### 3. Verify Database
```sql
SELECT 
  worker_name,
  date,
  ai_summary,
  sentiment,
  quality_score,
  tasks_completed
FROM daily_reports dr
JOIN users u ON dr.user_id = u.id
ORDER BY date DESC
LIMIT 10;
```

## Benefits

1. **Automated Analysis** - No manual review needed for basic insights
2. **Data-Driven Decisions** - Track productivity trends over time
3. **Quality Control** - AI flags low-quality reports
4. **Issue Detection** - Automatically identifies problems
5. **Accountability** - Full chat history for transparency
6. **Efficiency** - Quick approval/rejection workflow

## Next Steps

1. ✅ Restart server to run migrations
2. ✅ Test field worker report submission
3. ✅ Build frontend table component
4. ✅ Add filters and search
5. ✅ Add export to Excel/PDF
6. ✅ Add charts and visualizations

---

Your field worker progress tracking system with AI analysis is now complete! 🚀
