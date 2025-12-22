  export function renderLoginView() {
    return `
  <div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-6" data-i18n="login_title">Login</h2>
      <form id="login-form" class="space-y-6">
          <div>
              <label for="login-email" class="block text-sm font-medium text-gray-700">Email Address</label>
              <input id="login-email" name="email" type="email" autocomplete="email" required
                  class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div>
              <label for="login-password" class="block text-sm font-medium text-gray-700">Password</label>
              <input id="login-password" name="password" type="password" autocomplete="current-password" required
                  class="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <button type="submit"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Login
          </button>
          <p id="login-error" class="text-red-500 text-sm mt-2 text-center"></p>
      </form>
  </div>
  `;
  }