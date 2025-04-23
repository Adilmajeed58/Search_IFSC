document.addEventListener('DOMContentLoaded', () => {
  const branchInput = document.getElementById('branchInput');
  const suggestionsDiv = document.getElementById('suggestions');
  const branchSelect = document.getElementById('branch');
  const form = document.getElementById('ifscForm');
  const resetBtn = document.getElementById('resetBtn');
  const resultDiv = document.getElementById('result');

  let branches = [];

  // Fetch JSON data
  fetch('ifsc.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Raw JSON data:', data); // Debug: Raw JSON
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('JSON is not an array or is empty');
      }
      branches = data.map(item => {
        const branchData = {
          branch: item["Branch Name"],
          ifsc: item["IFSC Code "]
        };
        console.log('Processed:', branchData); // Debug: Each branch
        return branchData;
      }).filter(item => item.branch && item.ifsc); // Ensure no null/undefined
      console.log('Total Branches:', branches.length); // Debug: Branch count
      initializeDropdown();
    })
    .catch(error => {
      console.error('Error loading JSON:', error);
      resultDiv.textContent = 'Error loading branch data. Please check console for details.';
      resultDiv.classList.add('show');
    });

  function initializeDropdown() {
    // Populate Branch Name dropdown
    branches.sort((a, b) => a.branch.localeCompare(b.branch)); // Sort alphabetically
    console.log('Sorted Branches:', branches); // Debug: Sorted branches
    if (branches.length === 0) {
      resultDiv.textContent = 'No branches found. Check JSON data.';
      resultDiv.classList.add('show');
      return;
    }
    branches.forEach(branch => {
      const option = document.createElement('option');
      option.value = branch.branch;
      option.text = branch.branch;
      branchSelect.appendChild(option);
    });
    branchSelect.disabled = false;
  }

  // Debounce function to limit input event frequency
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Show autocomplete suggestions
  const showSuggestions = debounce(() => {
    const inputText = branchInput.value.trim();
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.classList.remove('show');

    if (inputText.length < 2) return; // Show suggestions after 2+ characters

    const matches = branches.filter(branch => 
      branch.branch.toLowerCase().includes(inputText.toLowerCase())
    ).slice(0, 10); // Limit to 10 suggestions

    if (matches.length === 0) return;

    matches.forEach(match => {
      const suggestion = document.createElement('div');
      suggestion.classList.add('suggestion-item');
      suggestion.textContent = match.branch;
      ['click', 'touchstart'].forEach(event => {
        suggestion.addEventListener(event, () => {
          branchInput.value = match.branch;
          suggestionsDiv.innerHTML = '';
          suggestionsDiv.classList.remove('show');
        });
      });
      suggestionsDiv.appendChild(suggestion);
    });
    suggestionsDiv.classList.add('show');
  }, 100);

  branchInput.addEventListener('input', showSuggestions);

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!branchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
      suggestionsDiv.innerHTML = '';
      suggestionsDiv.classList.remove('show');
    }
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let branchData = null;

    // Check text box first
    const inputText = branchInput.value.trim();
    if (inputText) {
      // Case-insensitive partial match
      branchData = branches.find(branch => 
        branch.branch.toLowerCase().includes(inputText.toLowerCase())
      );
    } else {
      // Fallback to dropdown
      const selectedBranch = branchSelect.value;
      branchData = branches.find(branch => branch.branch === selectedBranch);
    }

    if (branchData) {
      resultDiv.textContent = `IFSC Code: ${branchData.ifsc}`;
      resultDiv.classList.add('show');
    } else {
      resultDiv.textContent = 'Branch not found. Please try again.';
      resultDiv.classList.add('show');
    }

    // Clear suggestions
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.classList.remove('show');
  });

  // Handle reset
  resetBtn.addEventListener('click', () => {
    form.reset();
    branchInput.value = '';
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.classList.remove('show');
    resultDiv.textContent = '';
    resultDiv.classList.remove('show');
  });
});
