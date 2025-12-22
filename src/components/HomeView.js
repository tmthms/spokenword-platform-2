export function renderHomeView() {
    return `
  <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="md:flex">
          <div class="md:flex-shrink-0">
              <img class="h-48 w-full object-cover md:h-full md:w-64" src="https://placehold.co/600x400/6366f1/ffffff?text=Spoken+Word" alt="Spoken word artist performing">
          </div>
          <div class="p-8 md:p-12">
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900">Find Your Voice.</h1>
              <h2 class="text-2xl md:text-3xl font-semibold text-indigo-600">Book Your Artist.</h2>
              <p class="mt-4 text-lg text-gray-600">
                  The central database connecting spoken word artists with programmers and event organizers. 
                  Artists, create your profile. Programmers, find the perfect talent for your next event.
              </p>
              <div class="mt-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <button id="home-cta-artist" class="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-indigo-700 transition duration-300">
                      Ik ben een spoken word artiest: Meld je aan
                  </button>
                  <button id="home-cta-programmer" class="w-full md:w-auto bg-gray-800 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-gray-900 transition duration-300">
                      I'm a Programmer: Start Gratis Proefperiode
                  </button>
              </div>
          </div>
      </div>
  </div>

  <!-- Featured Artists Section -->
  <div class="mt-12">
      <h3 class="text-2xl font-bold text-center text-gray-900">Featured Artists</h3>
      <div class="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <!-- Featured Artist 1 (Placeholder) -->
          <div class="bg-white shadow-lg rounded-lg overflow-hidden">
              <img class="h-56 w-full object-cover" src="https://placehold.co/400x300/a78bfa/ffffff?text=Artist+1" alt="Featured Artist 1">
              <div class="p-6">
                  <h4 class="text-xl font-semibold">Artist Name</h4>
                  <p class="text-indigo-600">Genre: Performance Poetry</p>
                  <p class="text-gray-600 mt-2">Location: Amsterdam</p>
                  <p class="mt-3 text-gray-700">"A truly captivating performance that left the audience speechless." - Programmer Weekly</p>
              </div>
          </div>
          <!-- Featured Artist 2 (Placeholder) -->
          <div class="bg-white shadow-lg rounded-lg overflow-hidden">
              <img class="h-56 w-full object-cover" src="https://placehold.co/400x300/fca5a5/ffffff?text=Artist+2" alt="Featured Artist 2">
              <div class="p-6">
                  <h4 class="text-xl font-semibold">Stage Name</h4>
                  <p class="text-indigo-600">Genre: Poetry Slam</p>
                  <p class="text-gray-600 mt-2">Location: Brussels</p>
                  <p class="mt-3 text-gray-700">"Incredible energy and powerful words. A must-book for any festival." - Event Today</p>
              </div>
          </div>
          <!-- Featured Artist 3 (Placeholder) -->
          <div class="bg-white shadow-lg rounded-lg overflow-hidden">
              <img class="h-56 w-full object-cover" src="https://placehold.co/400x300/fdba74/ffffff?text=Artist+3" alt="Featured Artist 3">
              <div class="p-6">
                  <h4 class="text-xl font-semibold">Poet X</h4>
                  <p class="text-indigo-600">Genre: Storytelling</p>
                  <p class="text-gray-600 mt-2">Location: Ghent</p>
                  <p class="mt-3 text-gray-700">"A master storyteller. We had them back three times!" - The Culture Hub</p>
              </div>
          </div>
      </div>
  </div>
  `;
  }