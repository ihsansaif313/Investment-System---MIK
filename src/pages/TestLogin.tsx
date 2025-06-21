import React, { useState } from 'react';

const TestLogin: React.FC = () => {
  const [email, setEmail] = useState('ihsansaif@gmail.com');
  const [password, setPassword] = useState('Ihs@n2553.');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDirectLogin = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Testing direct login...');
      
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      console.log('Login response:', data);
      setResult(data);

      if (data.success) {
        console.log('Login successful!');
        console.log('User ID:', data.data?.user?.id);
        console.log('User email:', data.data?.user?.email);
        console.log('User role:', data.data?.user?.role?.type);
        console.log('Requires password setup:', data.requiresPasswordSetup);
      } else {
        setError(data.message || 'Login failed');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Login Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
          />
        </div>
        
        <button
          onClick={testDirectLogin}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Direct Login'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Success!</strong> Login response received.
          
          <div style={{ marginTop: '10px' }}>
            <h3>Response Details:</h3>
            <ul>
              <li><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</li>
              <li><strong>User ID:</strong> {result.data?.user?.id || 'N/A'}</li>
              <li><strong>User Email:</strong> {result.data?.user?.email || 'N/A'}</li>
              <li><strong>User Role:</strong> {result.data?.user?.role?.type || 'N/A'}</li>
              <li><strong>Token Present:</strong> {result.data?.token ? 'Yes' : 'No'}</li>
              <li><strong>Requires Password Setup:</strong> {result.requiresPasswordSetup ? 'Yes' : 'No'}</li>
            </ul>
          </div>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>Full Response JSON:</h3>
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Test Direct Login" to test the login API directly</li>
          <li>Check the browser console for detailed logs</li>
          <li>Verify the response structure matches expectations</li>
          <li>If this works, the issue is in the AuthContext</li>
        </ol>
      </div>
    </div>
  );
};

export default TestLogin;
