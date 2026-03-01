"""
Test script for Policy REACT Agent
"""
import os
import sys
from dotenv import load_dotenv
from react_agent import PolicyReactAgent

load_dotenv()


def test_basic_search():
    """Test basic department search"""
    print("\n" + "="*80)
    print("TEST 1: Basic Department Search")
    print("="*80)
    
    agent = PolicyReactAgent(max_attempts=5, retry_delay=1.0)
    
    # Test with department ID 1
    result = agent.fetch_policies(department_id=1)
    
    print(f"\n✅ Test completed")
    print(f"   Success: {result['success']}")
    print(f"   Policies found: {result['metadata']['total_policies_found']}")
    print(f"   Attempts: {result['metadata']['attempts']}")
    print(f"   Time: {result['metadata']['elapsed_time_seconds']}s")
    
    if result['policies']:
        print(f"\n📄 Sample policies:")
        for i, policy in enumerate(result['policies'][:3], 1):
            print(f"   {i}. {policy['title']} (ID: {policy['id']})")
    
    return result['success']


def test_without_department():
    """Test search without department filter"""
    print("\n" + "="*80)
    print("TEST 2: Search Without Department Filter")
    print("="*80)
    
    agent = PolicyReactAgent(max_attempts=5, retry_delay=1.0)
    
    result = agent.fetch_policies()
    
    print(f"\n✅ Test completed")
    print(f"   Success: {result['success']}")
    print(f"   Policies found: {result['metadata']['total_policies_found']}")
    print(f"   Attempts: {result['metadata']['attempts']}")
    
    return result['success']


def test_with_query_text():
    """Test search with query text"""
    print("\n" + "="*80)
    print("TEST 3: Search With Query Text")
    print("="*80)
    
    agent = PolicyReactAgent(max_attempts=5, retry_delay=1.0)
    
    result = agent.fetch_policies(
        department_id=1,
        query_text="traffic violations and parking rules"
    )
    
    print(f"\n✅ Test completed")
    print(f"   Success: {result['success']}")
    print(f"   Policies found: {result['metadata']['total_policies_found']}")
    
    return result['success']


def test_thought_log():
    """Test and display thought log"""
    print("\n" + "="*80)
    print("TEST 4: Thought Log Analysis")
    print("="*80)
    
    agent = PolicyReactAgent(max_attempts=3, retry_delay=0.5)
    
    result = agent.fetch_policies(department_id=999)  # Non-existent department
    
    print(f"\n📝 Thought Log ({len(result['metadata']['thought_log'])} entries):")
    for thought in result['metadata']['thought_log']:
        print(f"   [{thought['type'].upper()}] {thought['content']}")
    
    return True


def main():
    """Run all tests"""
    print("\n🧪 Policy REACT Agent Test Suite")
    print("="*80)
    
    # Check database connection
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ DATABASE_URL not set in .env file")
        sys.exit(1)
    
    print(f"✅ Database URL configured")
    
    tests = [
        ("Basic Department Search", test_basic_search),
        ("Search Without Department", test_without_department),
        ("Search With Query Text", test_with_query_text),
        ("Thought Log Analysis", test_thought_log),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"\n❌ Test failed with error: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n{passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
