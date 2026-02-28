# Integration Examples

## How to Integrate WhatsApp with Existing Features

### 1. Send WhatsApp Notification When Grievance Status Changes

In `src/controllers/grievance.controller.js`, add:

```javascript
import whatsappScheduler from '../services/whatsapp.scheduler.js';

// After updating grievance status
export const updateGrievanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Update in database
    await pool.query(
      'UPDATE grievances SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, id]
    );
    
    // Send WhatsApp notification
    await whatsappScheduler.sendGrievanceUpdateNotification(id);
    
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};
```

### 2. Allow Citizens to Submit Grievances via WhatsApp

Already implemented! Citizens can:
- Send text: "I want to report a pothole on Main Street"
- Share location
- Upload photos

The system automatically:
1. Detects it's a grievance
2. Routes to Query Analyst Agent
3. Creates grievance in database
4. Sends confirmation with grievance ID

### 3. Workers Submit Daily Progress via WhatsApp

Already implemented! Workers can:
- Send text: "Completed road repair work today"
- Upload photos as proof
- Share location

The system automatically:
1. Detects it's a progress report
2. Routes to Progress Tracking Agent
3. Stores in database
4. Analyzes progress

### 4. Department Staff Check Pending Items via WhatsApp

Already implemented! Staff can send:
- "Show pending grievances"
- "Give me analytics"
- "What's the status of grievance #1234"

### 5. Broadcast Announcements to All Citizens

In your admin panel, add a button that calls:

```javascript
// Frontend
const broadcastAnnouncement = async (message) => {
  const response = await fetch('/api/whatsapp-admin/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      role: 'citizen',
      message: message
    })
  });
  
  const result = await response.json();
  console.log(`Sent to ${result.stats.sent} users`);
};
```

### 6. Send Reminder to Specific Worker

```javascript
import whatsappService from '../services/whatsapp.service.js';

// In your worker management code
const sendReminderToWorker = async (workerId) => {
  const worker = await pool.query(
    'SELECT phone, name FROM users WHERE id = $1',
    [workerId]
  );
  
  if (worker.rows[0]?.phone) {
    await whatsappService.sendMessage(
      worker.rows[0].phone,
      `Hi ${worker.rows[0].name}, please submit your daily progress report.`
    );
  }
};
```

### 7. Interactive Grievance Status Check

When citizen asks about grievance, send buttons:

```javascript
// In agent.service.js
const grievanceId = '1234';
const status = await this.getGrievanceStatus(grievanceId, userId);

// Send status with action buttons
await whatsappService.sendMessage(phoneNumber, this.formatGrievanceStatus(status));
await whatsappService.sendButtons(
  phoneNumber,
  'What would you like to do?',
  ['Add Comment', 'Upload Photo', 'Close Grievance']
);
```

### 8. Weekly Report to Contractors

Add to scheduler:

```javascript
// In whatsapp.scheduler.js
async sendContractorWeeklyReport(contractorId) {
  const contractor = await pool.query(
    'SELECT phone, name FROM users WHERE id = $1',
    [contractorId]
  );
  
  const progress = await pool.query(`
    SELECT 
      COUNT(*) as tasks_completed,
      SUM(hours_worked) as total_hours
    FROM worker_progress
    WHERE worker_id = $1 
      AND created_at >= NOW() - INTERVAL '7 days'
  `, [contractorId]);
  
  const message = `📊 Your Weekly Report\n\n` +
    `Tasks Completed: ${progress.rows[0].tasks_completed}\n` +
    `Total Hours: ${progress.rows[0].total_hours}\n\n` +
    `Great work this week! 💪`;
  
  await whatsappService.sendMessage(contractor.rows[0].phone, message);
}
```

### 9. Emergency Broadcast

For urgent announcements:

```javascript
// In whatsapp-admin.routes.js
router.post('/emergency-broadcast', authenticateToken, async (req, res) => {
  const { message } = req.body;
  
  // Get all users with phones
  const users = await pool.query(
    'SELECT phone FROM users WHERE phone IS NOT NULL'
  );
  
  // Send to everyone immediately
  const promises = users.rows.map(user => 
    whatsappService.sendMessage(user.phone, `🚨 URGENT: ${message}`)
  );
  
  await Promise.all(promises);
  
  res.json({ success: true, sent: users.rows.length });
});
```

### 10. Auto-Escalation Reminder

If grievance is pending too long:

```javascript
// Run daily check
const checkOverdueGrievances = async () => {
  const overdue = await pool.query(`
    SELECT g.id, g.title, u.phone, u.name, d.name as dept_name
    FROM grievances g
    JOIN users u ON g.user_id = u.id
    JOIN departments d ON g.department_id = d.id
    WHERE g.status = 'pending'
      AND g.created_at < NOW() - INTERVAL '7 days'
      AND u.phone IS NOT NULL
  `);
  
  for (const grievance of overdue.rows) {
    await whatsappService.sendMessage(
      grievance.phone,
      `Your grievance #${grievance.id} "${grievance.title}" has been pending for over 7 days. ` +
      `We're escalating this to ${grievance.dept_name} management.`
    );
  }
};
```

### 11. Feedback Collection

After grievance is resolved:

```javascript
const requestFeedback = async (grievanceId) => {
  const grievance = await pool.query(`
    SELECT u.phone, u.name, g.title
    FROM grievances g
    JOIN users u ON g.user_id = u.id
    WHERE g.id = $1
  `, [grievanceId]);
  
  if (grievance.rows[0]?.phone) {
    await whatsappService.sendButtons(
      grievance.rows[0].phone,
      `Your grievance "${grievance.rows[0].title}" has been resolved. ` +
      `How satisfied are you with the resolution?`,
      ['Very Satisfied', 'Satisfied', 'Not Satisfied']
    );
  }
};
```

### 12. Location-Based Alerts

Send alerts to users in specific area:

```javascript
const sendLocationBasedAlert = async (latitude, longitude, radius, message) => {
  // Get users within radius
  const users = await pool.query(`
    SELECT u.phone, u.name
    FROM users u
    WHERE u.phone IS NOT NULL
      AND ST_DWithin(
        u.location::geography,
        ST_MakePoint($1, $2)::geography,
        $3
      )
  `, [longitude, latitude, radius]);
  
  for (const user of users.rows) {
    await whatsappService.sendMessage(
      user.phone,
      `📍 Local Alert: ${message}`
    );
  }
};
```

## Integration with Python Agents

### Progress Tracking Agent

Your Python agent should expose an API:

```python
# In AgenticWorkers/ProgressTrackingAgent/worker.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ProgressReport(BaseModel):
    worker_id: str
    worker_name: str
    message: str
    media: dict = None
    timestamp: str

@app.post("/api/progress")
async def process_progress(report: ProgressReport):
    # Process with LangGraph
    result = await graph.invoke({
        "worker_id": report.worker_id,
        "message": report.message,
        "media": report.media
    })
    
    return {
        "reply": result["reply"],
        "attachments": result.get("attachments", [])
    }
```

### Query Analyst Agent

```python
# In AgenticWorkers/QueryAnalyst/worker.py
@app.post("/api/analyze")
async def analyze_query(query: QueryRequest):
    # Analyze with LangGraph + DeepSeek
    result = await graph.invoke({
        "user_id": query.user_id,
        "message": query.message,
        "location": query.location,
        "media": query.media
    })
    
    # Create grievance if needed
    if result["is_grievance"]:
        grievance_id = await create_grievance(result)
        return {
            "reply": f"Grievance #{grievance_id} created successfully!",
            "grievance_id": grievance_id
        }
    
    return {
        "reply": result["reply"]
    }
```

## Testing Examples

### Test Worker Progress Report
```bash
# Send via WhatsApp
"Completed road repair work on MG Road today. Fixed 3 potholes."

# Or test via API
curl -X POST http://localhost:4000/api/whatsapp-admin/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919892885090",
    "message": "Please submit your daily progress report"
  }'
```

### Test Grievance Submission
```bash
# Send via WhatsApp
"I want to report a pothole on Main Street near the park"

# With location
[Share Location in WhatsApp]
"Pothole here needs urgent attention"
```

### Test Department Query
```bash
# Send via WhatsApp
"Show me pending grievances"
"Give me this week's analytics"
"What's the status of grievance #1234"
```

## Summary

The WhatsApp integration is designed to work seamlessly with your existing system:

1. **Automatic Routing**: Messages are automatically routed based on user role
2. **Agent Integration**: Connects to your Python LangGraph agents
3. **Database Integration**: Stores everything in your PostgreSQL database
4. **Blob Storage**: Uses your existing Azure Blob for media
5. **Extensible**: Easy to add new features and message types

Just update your `.env` and start testing! 🚀
