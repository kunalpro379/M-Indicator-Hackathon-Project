# Integration Guide: Policy REACT Agent

This guide shows how to integrate the Policy REACT Agent into your existing IGRS Portal system.

## Quick Start

### 1. Start the REACT Agent Service

```bash
cd Agents/PolicyReactAgent
chmod +x start.sh
./start.sh
```

Or manually:
```bash
cd Agents/PolicyReactAgent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install flask==3.0.0
python api_integration.py
```

### 2. Configure Server

Add to `Server/.env`:
```env
REACT_AGENT_URL=http://localhost:5000
```

### 3. Test the Integration

```bash
# Test REACT agent health
curl http://localhost:5000/health

# Test policy retrieval
curl http://localhost:5000/api/policies/department/1
```

## Frontend Integration

### React/Next.js Example

```typescript
// services/policyService.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Policy {
  id: number;
  title: string;
  content: string;
  department_id: number;
  file_url?: string;
  metadata?: any;
  created_at: string;
  similarity_score?: number;
}

export interface PolicySearchResult {
  success: boolean;
  policies: Policy[];
  metadata: {
    attempts: number;
    total_policies_found: number;
    elapsed_time_seconds: number;
    department_id?: number;
    thought_log?: Array<{
      timestamp: string;
      type: string;
      content: string;
    }>;
  };
  source?: string;
}

/**
 * Fetch department policies with guaranteed results using REACT agent
 */
export async function fetchDepartmentPoliciesGuaranteed(
  departmentId: number,
  options?: {
    maxAttempts?: number;
    retryDelay?: number;
  }
): Promise<PolicySearchResult> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/vector/policies/department/${departmentId}/react`,
      {
        params: {
          max_attempts: options?.maxAttempts || 10,
          retry_delay: options?.retryDelay || 2.0,
        },
        timeout: 60000, // 60 second timeout
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch policies:', error);
    throw error;
  }
}

/**
 * Search policies with embedding and REACT agent
 */
export async function searchPoliciesWithReact(
  embedding: number[],
  departmentId?: number,
  queryText?: string
): Promise<PolicySearchResult> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/vector/relevant-policies`,
      {
        embedding,
        department_id: departmentId,
        query_text: queryText,
        use_react: true, // Enable REACT agent
        limit: 10,
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Failed to search policies:', error);
    throw error;
  }
}
```

### React Component Example

```typescript
// components/DepartmentPolicies.tsx
import React, { useState, useEffect } from 'react';
import { fetchDepartmentPoliciesGuaranteed, Policy } from '@/services/policyService';

interface DepartmentPoliciesProps {
  departmentId: number;
}

export const DepartmentPolicies: React.FC<DepartmentPoliciesProps> = ({ departmentId }) => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    loadPolicies();
  }, [departmentId]);

  const loadPolicies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchDepartmentPoliciesGuaranteed(departmentId, {
        maxAttempts: 10,
        retryDelay: 2.0,
      });
      
      if (result.success) {
        setPolicies(result.policies);
        setMetadata(result.metadata);
      } else {
        setError('No policies found for this department');
      }
    } catch (err) {
      setError('Failed to load policies. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">
          Searching for policies... (REACT agent working)
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadPolicies}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metadata */}
      {metadata && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="text-blue-800">
            Found {metadata.total_policies_found} policies in {metadata.attempts} attempts
            ({metadata.elapsed_time_seconds}s)
          </p>
        </div>
      )}

      {/* Policies List */}
      <div className="space-y-3">
        {policies.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No policies available for this department
          </p>
        ) : (
          policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {policy.title}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {policy.content}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {new Date(policy.created_at).toLocaleDateString()}
                </span>
                {policy.file_url && (
                  <a
                    href={policy.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Document →
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
```

## Backend Integration

### Express.js Controller

```javascript
// controllers/department.controller.js
import { reactPolicyService } from '../services/react-policy.service.js';

export const getDepartmentPolicies = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { useReact = true } = req.query;

    if (useReact) {
      // Use REACT agent for guaranteed results
      const result = await reactPolicyService.getDepartmentPoliciesGuaranteed(
        departmentId,
        { maxAttempts: 10, retryDelay: 2.0 }
      );
      
      return res.json(result);
    }

    // Standard query (may return empty)
    const policies = await policyService.getPoliciesByDepartment(departmentId);
    
    res.json({
      success: policies.length > 0,
      policies,
      metadata: {
        total_policies_found: policies.length,
      },
    });
  } catch (error) {
    console.error('Get department policies error:', error);
    res.status(500).json({ error: 'Failed to get policies' });
  }
};
```

## API Endpoints

### 1. Get Department Policies (REACT)

**Endpoint:** `GET /api/vector/policies/department/:departmentId/react`

**Query Parameters:**
- `max_attempts` (optional): Maximum retry attempts (default: 10)
- `retry_delay` (optional): Delay between retries in seconds (default: 2.0)

**Response:**
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
      "created_at": "2024-01-01T00:00:00",
      "similarity_score": 0.85
    }
  ],
  "metadata": {
    "attempts": 2,
    "total_policies_found": 5,
    "elapsed_time_seconds": 4.2,
    "department_id": 1
  },
  "source": "react_agent"
}
```

### 2. Search Policies with REACT

**Endpoint:** `POST /api/vector/relevant-policies`

**Request Body:**
```json
{
  "embedding": [0.1, 0.2, ...],
  "department_id": 1,
  "query_text": "traffic violations",
  "use_react": true,
  "limit": 10
}
```

**Response:** Same as above

## Testing

### Test REACT Agent Directly

```bash
cd Agents/PolicyReactAgent
python test_agent.py
```

### Test via API

```bash
# Health check
curl http://localhost:5000/health

# Get department policies
curl "http://localhost:5000/api/policies/department/1?max_attempts=5&retry_delay=1.0"

# Search with embedding
curl -X POST http://localhost:5000/api/policies/search \
  -H "Content-Type: application/json" \
  -d '{
    "department_id": 1,
    "query_text": "traffic violations",
    "max_attempts": 10
  }'
```

### Test via Server API

```bash
# Using REACT agent
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/vector/policies/department/1/react?max_attempts=10"

# Standard endpoint with REACT flag
curl -X POST http://localhost:5000/api/vector/relevant-policies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "embedding": [0.1, 0.2, ...],
    "department_id": 1,
    "use_react": true
  }'
```

## Deployment

### Docker Deployment

Create `Agents/PolicyReactAgent/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install flask==3.0.0

COPY . .

EXPOSE 5000

CMD ["python", "api_integration.py"]
```

Build and run:
```bash
docker build -t policy-react-agent .
docker run -p 5000:5000 --env-file .env policy-react-agent
```

### Docker Compose

Add to your `docker-compose.yml`:

```yaml
services:
  policy-react-agent:
    build: ./Agents/PolicyReactAgent
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - MAX_RETRY_ATTEMPTS=10
      - RETRY_DELAY_SECONDS=2.0
    depends_on:
      - postgres
    restart: unless-stopped
```

## Monitoring

### Log Analysis

The REACT agent provides detailed thought logs:

```python
result = agent.fetch_policies(department_id=1)

# Analyze reasoning process
for thought in result['metadata']['thought_log']:
    print(f"[{thought['timestamp']}] {thought['type']}: {thought['content']}")
```

### Metrics to Track

- Average attempts per successful query
- Success rate
- Average elapsed time
- Most common failure reasons

## Troubleshooting

### Issue: No policies found after max attempts

**Solution:**
1. Check if policies exist in database
2. Verify embeddings are generated
3. Increase max_attempts
4. Check database connection

### Issue: REACT agent timeout

**Solution:**
1. Increase timeout in axios config
2. Reduce retry_delay
3. Check database performance

### Issue: Agent not starting

**Solution:**
1. Verify DATABASE_URL in .env
2. Check Python dependencies
3. Ensure port 5000 is available

## Best Practices

1. **Use REACT agent for critical queries** where you need guaranteed results
2. **Set appropriate timeouts** based on max_attempts × retry_delay
3. **Monitor thought logs** to understand agent behavior
4. **Cache successful results** to reduce database load
5. **Implement fallback** to direct queries if agent is unavailable

## Support

For issues or questions:
1. Check the thought log for debugging
2. Review the README.md for configuration
3. Test with test_agent.py
4. Check database connectivity
