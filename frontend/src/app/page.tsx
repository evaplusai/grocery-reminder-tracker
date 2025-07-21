export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🛒 Grocery Reminder Tracker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Voice-powered shopping lists that remember what you need
          </p>
        </header>

        <main className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🎤</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Getting Started
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Soon you'll be able to say "Add milk to my Costco list" and we'll handle the rest!
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">🏪 ShopRite</span>
                  <span className="text-sm text-gray-500">Coming soon</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">🏬 Costco</span>
                  <span className="text-sm text-gray-500">Coming soon</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">🛍️ Stop and Shop</span>
                  <span className="text-sm text-gray-500">Coming soon</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">💊 CVS</span>
                  <span className="text-sm text-gray-500">Coming soon</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
