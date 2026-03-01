# Quick Start Guide - Policy REACT Agent

Get the REACT agent running in 5 minutes!

## What is This?

A **REACT (Reasoning and Acting)** agent that keeps trying to fetch department policies from your vector database until it finds them. No more empty results!

## Installation

```bash
# 1. Navigate to agent directory
cd Agents/PolicyReactAgent

# 2. Create environment file
cp .env.example .env

# 3. Edit .env with your database URL
nano .env  # or use your favorite editor

# 4. Install dependencies
pip install -r requirements.txt
pip install flask==3.0.0
```

## Configuration

Edit `.env`:
```env
DATABASE_URL=postgresql://user:password@host:port/database
MAX_RETRY_ATTEMPTS=10
RETRY_DELAY_SECONDS=2.0
```

## Usage

### Option 1: Command Line (Quick Test)

```bash
# Search by department
python cli.py --department 1

# Search with verbose output
python cli.py --department 1 --verbose

# Search all policies
python cli.py --all

# Custom retry settings
python cli.py --department 1 --max-attempts 15 --retry-delay 3.0
```

### Option 2: Python API

```python
from react_agent import PolicyReactAgent

# Initialize
agent = PolicyReactAgent(max_attempts=10, retry_delay=2.0)

# Search
result = agent.fetch_policies(department_id=1)

# Check results
if result['success']:
    print(f"Found {len(result['policies'])} policies!")
    for policy in result['policies']:
        print(f"- {policy['title']}")
```

### Option 3: REST API

```bash
# Start the API server
python api_integration.py

# In another terminal, test it
curl http://localhost:5000/api/policies/department/1
```

## Integration with Your Server

### 1. Add to Server/.env

```env
REACT_AGENT_URL=http://localhost:5000
```

### 2. Use in Your Code

```javascript
// Guaranteed policy retrieval
const response = await axios.get(
  '/api/vector/policies/department/1/react'
);

console.log(response.data.policies);
```

## How It Works

```
User Request
    ↓
REACT Agent Loop:
  1. REASON  → Decide search strategy
  2. ACT     → Query database
  3. OBSERVE → Check results
  4. Repeat if needed
    ↓
Return Policies
```

The agent automatically:
- ✅ Retries until policies are found
- ✅ Adjusts search strategy each attempt
- ✅ Broadens search if needed
- ✅ Logs its reasoning process

## Testing

```bash
# Run test suite
python test_agent.py

# Expected output:
# ✅ PASS - Basic Department Search
# ✅ PASS - Search Without Department
# ✅ PASS - Search With Query Text
# ✅ PASS - Thought Log Analysis
```

## Common Issues

### "No policies found"
- Check if policies exist: `SELECT COUNT(*) FROM policydocuments;`
- Verify embeddings: `SELECT COUNT(*) FROM policydocuments WHERE embedding IS NOT NULL;`
- Increase max_attempts: `--max-attempts 20`

### "Connection refused"
- Check DATABASE_URL in .env
- Verify database is running
- Test connection: `psql $DATABASE_URL`

### "Module not found"
- Install dependencies: `pip install -r requirements.txt`
- Activate venv: `source venv/bin/activate`

## Next Steps

1. ✅ Test with CLI: `python cli.py --department 1 --verbose`
2. ✅ Start API server: `python api_integration.py`
3. ✅ Integrate with your frontend (see INTEGRATION_GUIDE.md)
4. ✅ Deploy to production (see README.md)

## Support

- Full documentation: `README.md`
- Integration guide: `INTEGRATION_GUIDE.md`
- Test suite: `python test_agent.py`
- CLI help: `python cli.py --help`

## Example Output

```
🤖 Policy REACT Agent
================================================================================
Searching for policies in department 1...

💭 [START] Starting policy search for department_id=1
💭 [REASONING] Attempt 1/10 - Analyzing query strategy
💭 [ACTING] Executing vector database query
💭 [OBSERVING] Found 5 policies
💭 [SUCCESS] Found relevant policies after 1 attempts

================================================================================
RESULTS
================================================================================
✅ Success!
   Found: 5 policies
   Attempts: 1
   Time: 0.45s

📄 Policies (showing 5):

1. Traffic Violation Policy
   ID: 1
   Department: 1
   Created: 2024-01-01
   Preview: This policy outlines the procedures for handling traffic violations...

2. Parking Rules and Regulations
   ID: 2
   Department: 1
   Created: 2024-01-02
   Preview: Guidelines for parking enforcement and citation procedures...
```

That's it! You now have a REACT agent that guarantees policy retrieval. 🎉
