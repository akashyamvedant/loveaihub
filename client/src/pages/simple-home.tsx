import { useAuth } from "@/hooks/useAuth";

export default function SimpleHome() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">LoveAIHub</h1>
          <p className="text-xl mb-8">Your AI-Powered Content Creation Platform</p>
          <div className="space-y-4">
            <a href="/api/auth/signin" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg inline-block">
              Sign In
            </a>
            <div>
              <a href="/api/auth/signup" className="text-purple-300 hover:text-white">
                Create Account
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome, {user?.email}!</h1>
        <p className="text-xl mb-8">LoveAIHub Dashboard</p>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold">AI Chat</h3>
            <p className="text-sm text-gray-300">Chat with AI models</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold">Image Generation</h3>
            <p className="text-sm text-gray-300">Create AI images</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold">Video Generation</h3>
            <p className="text-sm text-gray-300">Generate videos</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="font-semibold">Audio Speech</h3>
            <p className="text-sm text-gray-300">Text to speech</p>
          </div>
        </div>
        <div className="mt-8">
          <button
            onClick={() => fetch('/api/auth/signout', { method: 'POST' }).then(() => window.location.replace('/'))}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}