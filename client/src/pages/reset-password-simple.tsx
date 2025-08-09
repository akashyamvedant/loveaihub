// Simple test page to verify routing works
export default function ResetPasswordSimple() {
  console.log('Simple reset password page loaded - URL:', window.location.href);
  
  // Force visible content immediately
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      color: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 9999
    }}>
      <h1>Reset Password Test Page</h1>
      <p>If you can see this, the routing is working!</p>
      <p>Current URL: {window.location.href}</p>
      <p>Hash: {window.location.hash}</p>
      <p>Search: {window.location.search}</p>
      <button 
        onClick={() => window.location.href = '/'} 
        style={{
          padding: '10px 20px',
          backgroundColor: '#4a5568',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Go Home
      </button>
    </div>
  );
}