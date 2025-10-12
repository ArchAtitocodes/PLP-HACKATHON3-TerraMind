import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold text-green-800 mb-4">
          Welcome to TerraMind 🌍
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your AI-Powered assistant for land regeneration and sustainable agriculture.
        </p>
        <div className="space-x-4">
          <Link href="/dashboard" legacyBehavior>
            <a className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition">
              Go to Dashboard
            </a>
          </Link>
          <Link href="/login" legacyBehavior>
            <a className="px-6 py-3 bg-white text-green-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 transition">
              Login
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}