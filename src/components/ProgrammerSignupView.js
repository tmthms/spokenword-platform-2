  export function renderProgrammerSignupView() {
    return `
  <div class="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h2 class="text-3xl font-bold text-center text-gray-900 mb-6">Create Your Programmer Account</h2>
      <p class="text-center text-gray-600 mb-6">Start your 7-day free trial. Your account will be reviewed by an admin before activation.</p>
      <form id="programmer-signup-form" class="space-y-6">
          <!-- Account Credentials -->
          <div class="border-b border-gray-200 pb-6">
              <h3 class="text-xl font-semibold mb-4">Account Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label for="prog-email" class="block text-sm font-medium text-gray-700">Email Address *</label>
                      <input id="prog-email" type="email" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  </div>
                  <div>
                      <label for="prog-password" class="block text-sm font-medium text-gray-700">Password (min. 6 chars) *</label>
                      <input id="prog-password" type="password" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  </div>
              </div>
          </div>

          <!-- Organization Details -->
          <div class="border-b border-gray-200 pb-6">
              <h3 class="text-xl font-semibold mb-4">Your & Organization Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label for="prog-firstname" class="block text-sm font-medium text-gray-700">First Name *</label>
                      <input id="prog-firstname" type="text" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  </div>
                  <div>
                      <label for="prog-lastname" class="block text-sm font-medium text-gray-700">Last Name *</label>
                      <input id="prog-lastname" type="text" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  </div>
                  <div class="md:col-span-2">
                      <label for="prog-org-name" class="block text-sm font-medium text-gray-700">Organization Name *</label>
                      <input id="prog-org-name" type="text" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  </div>
                   <div>
                      <label for="prog-phone" class="block text-sm font-medium text-gray-700">Phone Number *</label>
                      <input id="prog-phone" type="tel" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  </div>
                  <div>
                      <label for="prog-website" class="block text-sm font-medium text-gray-700">Link Website</label>
                      <input id="prog-website" type="url" placeholder="https://..." class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                  </div>
                  <div class="md:col-span-2">
                      <label for="prog-org-about" class="block text-sm font-medium text-gray-700">About Organization</label>
                      <textarea id="prog-org-about" rows="3" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                  </div>
              </div>
          </div>

          <!-- Notifications & Terms -->
          <div>
              <h3 class="text-xl font-semibold mb-4">Settings & Terms</h3>
              <div class="space-y-4">
                  <div class="flex items-start">
                      <input id="prog-notify-email" type="checkbox" checked class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                      <label for="prog-notify-email" class="ml-3 block text-sm text-gray-700">OK to receive email notifications.</label>
                  </div>
                  <div class="flex items-start">
                      <input id="prog-terms" type="checkbox" required class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                      <label for="prog-terms" class="ml-3 block text-sm text-gray-700">I agree with the <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Terms & Conditions</a>. *</label>
                  </div>
              </div>
          </div>

          <button type="submit"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
              Start Free Trial
          </button>
          <p id="programmer-signup-error" class="text-red-500 text-sm mt-2 text-center"></p>
      </form>
  </div>
  `;
  }