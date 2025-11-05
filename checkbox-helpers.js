/**
 * checkbox-helpers.js
 * Helper functies voor het werken met checkbox groepen in plaats van multi-select
 */

/**
 * Haalt geselecteerde waarden op uit een checkbox groep
 * @param {string} name - De name attribute van de checkboxes
 * @returns {Array<string>} Array met geselecteerde waarden
 */
export function getCheckboxValues(name) {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
  return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Zet checkboxes op basis van een array van waarden
 * @param {string} name - De name attribute van de checkboxes
 * @param {Array<string>} values - Array met te selecteren waarden
 */
export function setCheckboxValues(name, values = []) {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
  checkboxes.forEach(checkbox => {
    checkbox.checked = values.includes(checkbox.value);
  });
}

/**
 * Valideert of er minimaal één checkbox geselecteerd is
 * @param {string} name - De name attribute van de checkboxes
 * @returns {boolean} True als er minimaal één checkbox geselecteerd is
 */
export function validateCheckboxGroup(name) {
  const checked = document.querySelectorAll(`input[name="${name}"]:checked`);
  return checked.length > 0;
}

/**
 * Voegt validatie toe aan een checkbox groep
 * @param {string} name - De name attribute van de checkboxes
 * @param {string} errorMessage - Foutmelding die getoond moet worden
 */
export function addCheckboxValidation(name, errorMessage = "Please select at least one option") {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
  
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const isValid = validateCheckboxGroup(name);
      
      // Vind of maak error message element
      const container = checkbox.closest('.mb-4') || checkbox.closest('div');
      let errorElement = container.querySelector('.checkbox-error');
      
      if (!isValid && !errorElement) {
        errorElement = document.createElement('p');
        errorElement.className = 'checkbox-error text-red-500 text-sm mt-1';
        errorElement.textContent = errorMessage;
        container.appendChild(errorElement);
      } else if (isValid && errorElement) {
        errorElement.remove();
      }
    });
  });
}