import React from 'react';

function TestApp() {
  return (
    <div className="w-full min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🎉 Investment Management System</h1>
        <p className="text-xl text-slate-300 mb-8">Frontend is working correctly!</p>
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>React:</span>
              <span className="text-green-400">✅ Working</span>
            </div>
            <div className="flex justify-between">
              <span>TypeScript:</span>
              <span className="text-green-400">✅ Working</span>
            </div>
            <div className="flex justify-between">
              <span>Tailwind CSS:</span>
              <span className="text-green-400">✅ Working</span>
            </div>
            <div className="flex justify-between">
              <span>Vite:</span>
              <span className="text-green-400">✅ Working</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-4">
          If you can see this page, the frontend is running correctly!
        </p>
      </div>
    </div>
  );
}

export default TestApp;
