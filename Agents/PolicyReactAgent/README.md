# Policy REACT Agent

A **REACT (Reasoning and Acting)** agent that continuously fetches department policies from the vector database until they are found. This agent implements a persistent retry mechanism with adaptive query strategies.

## What is REACT?

REACT is an AI agent pattern that combines:
- **Reasoning**: Analyzing the situation and deciding on the best strategy
- **Acting**: Executing queries based on the strategy
- **Observing**: Evaluating results and deciding next steps

This agent keeps trying different approaches until it successfully finds policies.

## Features

- ✅ Persistent retry mechanism (keeps trying until policies are found)
- ✅ Adaptive query strategies (adjusts search parameters based on results)
- ✅ Vector similarity search with pgvector
- ✅ Department-based filtering
- ✅ Automatic threshold adjustment
- ✅ Detailed thought logging for debugging
- ✅ REST API integration
- ✅ Fallback to direct database queries

## Architecture

```
┌─────────────────┐
│  Client Request │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  REACT Agent Loop       │
│  ┌─────────────────┐   │
│  │ 1. REASON       │   │  Analyze strategy
│  │    Strategy     │   │  (threshold, filters)
│  └────────┬────────┘   │
│           │            │
│           ▼            │
│  ┌─────────────────┐   │
│  │ 2. ACT          │   │  Execute query
│  │    Query DB     │   │  (vector search)
│  └────────┬────────┘   │
│           │            │
│           ▼            │
│  ┌─────────────────┐   │
│  │ 3. OBSERVE      │   │  Evaluate results
│  │    Analyze      │   │  (found? relevant?)
│  └────────┬────────┘   │
│           │            │
│           ▼            │
│      Found? ───No──────┤ Retry with
│           │            │ new strategy
│          Yes           │
└───────────┬────────────┘
            │
            ▼
    ┌───────────────┐
    │ Return Policies│
    └───────────────┘
```

## Installation

1. Install dependencies:
```bash
cd Agents/PolicyReactAgent
pip install -r requirements.txt
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Set up database connection:
```env
DATABASE_URL=postgresql://user:password@host:port/database
MAX_RETRY_ATTEMPTS=10
RETRY_DELAY_SECONDS=2.0
```

## Usage

### Python API

```python
from react_agent import PolicyReactAgent

# Initialize agent
agent = PolicyReactAgent(max_attempts=10, retry_delay=2.0)

# Search by department
result = agent.fetch_policies(department_id=1)

# Search with embedding
result = agent.fetch_policies(
    department_id=1,
    query_embedding=[0.1, 0.2, ...],  # 1536-dim vector
    query_text="traffic violations"
)

# Check results
if result['success']:
    print(f"Found {len(result['policies'])} policies")
    for policy in result['policies']:
        print(f"- {policy['title']}")
else:
    print("No policies found after all attempts")

# View agent's reasoning
for thought in result['metadata']['thought_log']:
    print(f"[{thought['type']}] {thought['content']}")
```

### REST API

Start the Flask server:
```bash
python api_integration.py
```

#### Endpoints

**1. Search Policies (POST /api/policies/search)**
```bash
curl -X POST http://localhost:5000/api/policies/search \
  -H "Content-Type: application/json" \
  -d '{
    "department_id": 1,
    "query_text": "traffic violations",
    "query_embedding": [0.1, 0.2, ...],
    "max_attempts": 10,
    "retry_delay": 2.0
  }'
```

**2. Get Department Policies (GET /api/policies/department/:id)**
```bash
curl http://localhost:5000/api/policies/department/1?max_attempts=10&retry_delay=2.0
```

**3. Health Check (GET /health)**
```bash
curl http://localhost:5000/health
```

### Node.js Integration

The REACT agent is integrated into your existing Server:

```javascript
// Use REACT agent for guaranteed results
const response = await axios.post('/api/vector/relevant-policies', {
  embedding: [0.1, 0.2, ...],
  department_id: 1,
  use_react: true  // Enable REACT agent
});

// Or use dedicated endpoint
const response = await axios.get('/api/vector/policies/department/1/react', {
  params: {
    max_attempts: 10,
    retry_delay: 2.0
  }
});
```

## How It Works

### Adaptive Strategy

The agent adjusts its search strategy based on attempt number:

| Attempt | Strategy |
|---------|----------|
| 1-3 | Standard search with threshold 0.7 |
| 4-6 | Lower threshold to 0.5, increase limit to 20 |
| 7+ | Remove department filter, search all policies |

### Thought Process Example

```
💭 [START] Starting policy search for department_id=1
💭 [REASONING] Attempt 1/10 - Analyzing query strategy
💭 [ACTING] Executing vector database query
💭 [OBSERVING] No policies found, will retry with adjusted strategy
💭 [WAITING] Retrying in 2.0 seconds...
💭 [REASONING] Attempt 2/10 - Analyzing query strategy
💭 [ACTING] Executing vector database query
💭 [OBSERVING] Found 5 policies
💭 [OBSERVING] 3 policies meet relevance threshold
💭 [SUCCESS] Found relevant policies after 2 attempts
```

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# REACT Agent Settings
MAX_RETRY_ATTEMPTS=10        # Maximum retry attempts
RETRY_DELAY_SECONDS=2.0      # Delay between retries
SIMILARITY_THRESHOLD=0.7     # Initial similarity threshold

# API Server (for api_integration.py)
PORT=5000
```

### Agent Parameters

```python
agent = PolicyReactAgent(
    max_attempts=10,      # How many times to retry
    retry_delay=2.0       # Seconds between retries
)
```

## Integration with Existing System

### Server Configuration

Add to `Server/.env`:
```env
REACT_AGENT_URL=http://localhost:5000
```

### Using in Controllers

```javascript
import { reactPolicyService } from '../services/react-policy.service.js';

// With retry logic
const result = await reactPolicyService.fetchPoliciesWithRetry(
  departmentId,
  embedding,
  queryText,
  { maxAttempts: 10, retryDelay: 2.0 }
);

// Direct with fallback
const result = await reactPolicyService.fetchPoliciesDirectWithRetry(
  departmentId,
  10,  // max attempts
  2000 // delay in ms
);
```

## Response Format

```json
{
  "success": true,
  "policies": [
    {
      "id": 1,
      "title": "Traffic Violation Policy",
      "content": "...",
      "department_id": 1,
      "file_url": "https://...",
      "metadata": {},
      "created_at": "2024-01-01T00:00:00",
      "similarity_score": 0.85
    }
  ],
  "metadata": {
    "attempts": 2,
    "total_policies_found": 5,
    "elapsed_time_seconds": 4.2,
    "department_id": 1,
    "thought_log": [...]
  }
}
```

## Troubleshooting

### No Policies Found

1. Check if policies exist in database:
```sql
SELECT COUNT(*) FROM policydocuments WHERE department_id = 1;
```

2. Check if embeddings are generated:
```sql
SELECT COUNT(*) FROM policydocuments WHERE embedding IS NOT NULL;
```

3. Review thought log for insights:
```python
result = agent.fetch_policies(department_id=1)
for thought in result['metadata']['thought_log']:
    print(thought)
```

### Agent Timeout

Increase max_attempts or retry_delay:
```python
agent = PolicyReactAgent(max_attempts=20, retry_delay=3.0)
```

### Database Connection Issues

Verify DATABASE_URL format:
```
postgresql://username:password@host:port/database
```

## Testing

Run the example:
```bash
python react_agent.py
```

Expected output:
```
💭 [START] Starting policy search for department_id=1
💭 [REASONING] Attempt 1/10 - Analyzing query strategy
💭 [ACTING] Executing vector database query
💭 [OBSERVING] Found 5 policies
💭 [SUCCESS] Found relevant policies after 1 attempts

================================================================================
FINAL RESULT
================================================================================
Success: True
Policies found: 5
Attempts: 1
Time: 0.45s
```

## Performance

- Average query time: 0.5-2 seconds per attempt
- Typical success: 1-3 attempts
- Maximum time: max_attempts × retry_delay seconds

## Future Enhancements

- [ ] Exponential backoff for retry delays
- [ ] Caching of successful queries
- [ ] Multi-department batch queries
- [ ] Real-time policy updates via webhooks
- [ ] Integration with embedding generation pipeline
- [ ] Metrics and monitoring dashboard

## License

Part of the IGRS Portal project.
