document.addEventListener('DOMContentLoaded', () => {
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
  
    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const selectedBranch = branchSelect.value;
      const branchData = branches.find(branch => branch.branch === selectedBranch);
      if (branchData) {
        resultDiv.textContent = `IFSC Code: ${branchData.ifsc}`;
        resultDiv.classList.add('show');
      } else {
        resultDiv.textContent = 'IFSC Code not found';
        resultDiv.classList.add('show');
      }
    });
  
    // Handle reset
    resetBtn.addEventListener('click', () => {
      form.reset();
      resultDiv.textContent = '';
      resultDiv.classList.remove('show');
    });
  });