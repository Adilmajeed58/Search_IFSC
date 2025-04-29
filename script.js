document.addEventListener('DOMContentLoaded', () => {
  // State
  let selectedBank = "";
  let currentData = [];
  let isLoggedIn = false;
  let editIFSC = null;
  let hdfcData = [];
  let jkData = [];

  // Hard-coded Credentials
  const credentials = {
    hdfc: { username: "hdfc_admin", password: "hdfc123" },
    jk: { username: "jk_admin", password: "jk123" }
  };

  // Fallback Data (for testing if JSON fails)
  const fallbackHdfcData = [
    { IFSC: "HDFC0000001", BRANCH: "TULSIANI CHMBRS - NARIMAN PT" },
    { IFSC: "HDFC0000002", BRANCH: "MUMBAI - KHAR WEST" },
    { IFSC: "HDFC0000003", BRANCH: "K G MARG" }
  ];
  const fallbackJkData = [
    { "S.No.": "1", "Sol Id": "0005", "Branch Name": "RESIDENCY ROAD SRINAGAR", "Alpha Code ": "CHINAR", "IFSC Code ": "JAKA0CHINAR" },
    { "S.No.": "2", "Sol Id": "0006", "Branch Name": "DALGATE SRINAGAR", "Alpha Code ": "DALGATE", "IFSC Code ": "JAKA0DALGATE" }
  ];

  // DOM Elements
  const bankSelect = document.getElementById("bankSelect");
  const branchInput = document.getElementById("branchInput");
  const suggestions = document.getElementById("suggestions");
  const branchSelect = document.getElementById("branch");
  const ifscForm = document.getElementById("ifscForm");
  const resetBtn = document.getElementById("resetBtn");
  const resultDiv = document.getElementById("result");
  const loginBtn = document.getElementById("loginBtn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const home = document.getElementById("home");
  const dashboard = document.getElementById("dashboard");
  const logoutBtn = document.getElementById("logoutBtn");
  const dynamicForm = document.getElementById("dynamicForm");
  const saveBtn = document.getElementById("saveBtn");
  const tableHead = document.getElementById("tableHead");
  const tableBody = document.getElementById("tableBody");
  const loginForm = document.getElementById("loginForm");

  // Fetch JSON Data
  async function loadJSON() {
    try {
      console.log('Fetching hdfc.json...');
      const hdfcResponse = await fetch('hdfc.json');
      if (!hdfcResponse.ok) {
        throw new Error(`Failed to fetch hdfc.json: ${hdfcResponse.status} ${hdfcResponse.statusText}`);
      }
      const rawHdfcData = await hdfcResponse.json();
      console.log('Raw HDFC Data Length:', rawHdfcData.length);
      console.log('Raw HDFC Data Sample:', rawHdfcData[0]);

      console.log('Fetching ifsc.json...');
      const jkResponse = await fetch('ifsc.json');
      if (!jkResponse.ok) {
        throw new Error(`Failed to fetch ifsc.json: ${jkResponse.status} ${jkResponse.statusText}`);
      }
      jkData = await jkResponse.json();
      console.log('Raw J&K Data Length:', jkData.length);
      console.log('Raw J&K Data Sample:', jkData.slice(0, 2));

      // Normalize HDFC data (flatten multiple keys in single object)
      hdfcData = [];
      rawHdfcData.forEach(item => {
        Object.values(item).forEach(branch => {
          if (branch && branch.IFSC && branch.BRANCH) {
            hdfcData.push(branch);
          }
        });
      });
      console.log('Normalized HDFC Data Length:', hdfcData.length);
      console.log('Normalized HDFC Data Sample:', hdfcData.slice(0, 2));

      // Filter J&K data
      jkData = jkData.filter(item => item && item["IFSC Code "] && item["Branch Name"]);
      console.log('Filtered J&K Data Length:', jkData.length);
      console.log('Filtered J&K Data Sample:', jkData.slice(0, 2));

      if (!hdfcData.length || !jkData.length) {
        throw new Error('One or both JSON files are empty or invalid.');
      }
    } catch (error) {
      console.error('Error loading JSON:', error.message);
      resultDiv.textContent = `Error loading bank data: ${error.message}. Using fallback data.`;
      resultDiv.classList.add('show');
      alert(`Failed to load JSON files: ${error.message}. Using fallback data for testing.`);
      hdfcData = fallbackHdfcData;
      jkData = fallbackJkData;
      console.log('Using Fallback HDFC Data:', hdfcData);
      console.log('Using Fallback J&K Data:', jkData);
    }
  }

  // Initialize Data
  async function initializeData() {
    if (!hdfcData.length || !jkData.length) {
      await loadJSON();
    }
    currentData = selectedBank === "hdfc" ? hdfcData : jkData;
    console.log('Selected Bank:', selectedBank, 'Current Data Length:', currentData.length);
    console.log('Current Data Sample:', currentData.slice(0, 2));
    initializeDropdown();
  }

  // Populate Branch Dropdown
  function initializeDropdown() {
    branchSelect.innerHTML = '<option value="" disabled selected>Select Branch</option>';
    if (!currentData.length) {
      resultDiv.textContent = 'No branches found for selected bank.';
      resultDiv.classList.add('show');
      branchInput.disabled = true;
      branchSelect.disabled = true;
      console.warn('No branches available for', selectedBank);
      return;
    }
    currentData.sort((a, b) => {
      const branchA = selectedBank === "hdfc" ? a.BRANCH : a["Branch Name"];
      const branchB = selectedBank === "hdfc" ? b.BRANCH : a["Branch Name"];
      return (branchA || "").localeCompare(branchB || "");
    });
    currentData.forEach(item => {
      const branch = selectedBank === "hdfc" ? item.BRANCH : item["Branch Name"];
      if (branch) {
        const option = document.createElement("option");
        option.value = branch;
        option.text = branch;
        branchSelect.appendChild(option);
      }
    });
    branchInput.disabled = false;
    branchSelect.disabled = false;
    console.log('Dropdown Populated:', branchSelect.options.length, 'options');
  }

  // Bank Selection
  bankSelect.addEventListener("change", async (e) => {
    selectedBank = e.target.value;
    console.log('Bank Selected:', selectedBank);
    resultDiv.textContent = '';
    resultDiv.classList.remove('show');
    branchInput.value = '';
    suggestions.innerHTML = '';
    suggestions.classList.remove('show');
    branchInput.disabled = true;
    branchSelect.disabled = true;
    await initializeData();
  });

  // Autocomplete Suggestions
  function updateSuggestions() {
    const inputText = branchInput.value.trim();
    suggestions.innerHTML = '';
    suggestions.classList.remove('show');

    if (inputText.length < 2 || !selectedBank || !currentData.length) {
      console.log('Input too short, no bank selected, or no data:', { inputText, selectedBank, dataLength: currentData.length });
      return;
    }

    console.log('Filtering suggestions for:', inputText, 'with data:', currentData.slice(0, 2));
    const matches = currentData
      .filter(item => {
        const branch = selectedBank === "hdfc" ? item.BRANCH : item["Branch Name"];
        const isMatch = branch && typeof branch === 'string' && branch.toLowerCase().includes(inputText.toLowerCase());
        console.log('Checking branch:', branch, 'Match:', isMatch);
        return isMatch;
      })
      .slice(0, 10);

    console.log('Suggestions for', inputText, ':', matches.length, 'matches', matches.map(item => selectedBank === "hdfc" ? item.BRANCH : item["Branch Name"]));

    if (matches.length === 0) {
      console.log('No matching branches found.');
      return;
    }

    matches.forEach(item => {
      const branch = selectedBank === "hdfc" ? item.BRANCH : item["Branch Name"];
      const suggestion = document.createElement("div");
      suggestion.classList.add("suggestion-item");
      suggestion.textContent = branch;
      console.log('Adding suggestion:', branch);
      suggestion.addEventListener("click", () => {
        branchInput.value = branch;
        suggestions.innerHTML = '';
        suggestions.classList.remove('show');
        console.log('Suggestion selected:', branch);
      });
      suggestions.appendChild(suggestion);
    });

    // Delay showing suggestions to ensure DOM updates
    setTimeout(() => {
      if (matches.length > 0) {
        suggestions.classList.add('show');
        const computedStyle = window.getComputedStyle(suggestions);
        console.log('Suggestions shown:', {
          html: suggestions.innerHTML,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          position: computedStyle.position,
          zIndex: computedStyle.zIndex
        });
      }
    }, 0);
  }

  // Attach input and keyup events
  branchInput.addEventListener("input", () => {
    console.log('Input event triggered:', branchInput.value);
    updateSuggestions();
  });

  branchInput.addEventListener("keyup", () => {
    console.log('Keyup event triggered:', branchInput.value);
    updateSuggestions();
  });

  // Hide Suggestions on Click Outside (debounced)
  let isTyping = false;
  branchInput.addEventListener("input", () => {
    isTyping = true;
    setTimeout(() => { isTyping = false; }, 300);
  });

  document.addEventListener("click", (e) => {
    if (isTyping) {
      console.log('Click ignored due to active typing');
      return;
    }
    if (!branchInput.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.innerHTML = '';
      suggestions.classList.remove('show');
      console.log('Suggestions hidden due to click outside');
    }
  });

  // Form Submission
  ifscForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let branchData = null;

    const inputText = branchInput.value.trim();
    if (inputText) {
      branchData = currentData.find(item => {
        const branch = selectedBank === "hdfc" ? item.BRANCH : item["Branch Name"];
        return branch && branch.toLowerCase() === inputText.toLowerCase();
      });
    } else {
      const selectedBranch = branchSelect.value;
      branchData = currentData.find(item => {
        const branch = selectedBank === "hdfc" ? item.BRANCH : item["Branch Name"];
        return branch === selectedBranch;
      });
    }

    console.log('Form Submission - Branch Data:', branchData);

    if (branchData) {
      const ifsc = selectedBank === "hdfc" ? branchData.IFSC : branchData["IFSC Code "];
      resultDiv.textContent = `IFSC Code: ${ifsc}`;
      resultDiv.classList.add('show');
    } else {
      resultDiv.textContent = 'Branch not found. Please try again.';
      resultDiv.classList.add('show');
    }

    suggestions.innerHTML = '';
    suggestions.classList.remove('show');
  });

  // Reset Form
  resetBtn.addEventListener("click", () => {
    ifscForm.reset();
    branchInput.value = '';
    suggestions.innerHTML = '';
    suggestions.classList.remove('show');
    resultDiv.textContent = '';
    resultDiv.classList.remove('show');
    console.log('Form Reset');
  });

  // Login
  loginBtn.addEventListener("click", () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    console.log('Login Attempt:', { username, password, selectedBank });

    if (!selectedBank) {
      alert("Please select a bank first.");
      console.warn('Login failed: No bank selected');
      return;
    }

    const creds = credentials[selectedBank];
    if (!creds) {
      alert("Invalid bank selection.");
      console.warn('Login failed: Invalid bank');
      return;
    }

    if (username === creds.username && password === creds.password) {
      isLoggedIn = true;
      home.classList.add("hidden");
      dashboard.classList.remove("hidden");
      loginForm.classList.add("hidden");
      logoutBtn.classList.remove("hidden");
      renderDashboard();
      console.log('Login Successful');
    } else {
      alert("Invalid credentials.");
      console.warn('Login Failed: Invalid credentials');
    }
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    isLoggedIn = false;
    home.classList.remove("hidden");
    dashboard.classList.add("hidden");
    usernameInput.value = "";
    passwordInput.value = "";
    bankSelect.value = "";
    branchInput.disabled = true;
    branchSelect.disabled = true;
    branchInput.value = '';
    suggestions.innerHTML = '';
    resultDiv.textContent = '';
    loginForm.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    selectedBank = "";
    console.log('Logged Out');
  });

  // Render Dashboard
  function renderDashboard() {
    renderForm();
    renderTable();
  }

  // Render Dynamic Form
  function renderForm() {
    dynamicForm.innerHTML = "";
    const fields = selectedBank === "hdfc" ? 
      ["IFSC", "BRANCH", "MICR", "ADDRESS", "STATE", "CONTACT", "CITY", "CENTRE", "DISTRICT", "SWIFT"] :
      ["S.No.", "Sol Id", "Branch Name", "Alpha Code ", "IFSC Code "];

    fields.forEach(field => {
      const div = document.createElement("div");
      div.className = "mb-4";
      div.innerHTML = `
        <label class="block text-sm font-medium text-[#333333] mb-2">${field}</label>
        <input type="text" data-field="${field}" class="w-full p-2 border border-[#DDDDDD] bg-white" placeholder="Enter ${field}">
      `;
      dynamicForm.appendChild(div);
    });
    console.log('Dynamic Form Rendered:', fields);
  }

  // Render Table
  function renderTable() {
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";
    const fields = selectedBank === "hdfc" ? 
      ["IFSC", "BRANCH", "MICR", "ADDRESS", "STATE", "CONTACT"] :
      ["S.No.", "Sol Id", "Branch Name", "Alpha Code ", "IFSC Code "];
    const labels = selectedBank === "hdfc" ? 
      ["IFSC", "Branch", "MICR", "Address", "State", "Contact"] :
      ["S.No.", "Sol Id", "Branch Name", "Alpha Code", "IFSC Code"];

    const table = document.querySelector("table");
    table.classList.remove("hdfc-table", "jk-table");
    table.classList.add(selectedBank === "hdfc" ? "hdfc-table" : "jk-table");

    const trHead = document.createElement("tr");
    fields.forEach(field => {
      const th = document.createElement("th");
      th.className = "border p-2 text-[#333333]";
      th.textContent = field;
      trHead.appendChild(th);
    });
    const thAction = document.createElement("th");
    thAction.className = "border p-2 text-[#333333]";
    thAction.textContent = "Actions";
    trHead.appendChild(thAction);
    tableHead.appendChild(trHead);

    currentData.forEach((item, index) => {
      const tr = document.createElement("tr");
      fields.forEach((field, i) => {
        const td = document.createElement("td");
        td.className = "border p-2 text-[#333333]";
        td.setAttribute("data-label", labels[i]);
        td.textContent = item[field] || "";
        tr.appendChild(td);
      });
      const tdAction = document.createElement("td");
      tdAction.className = "border p-2 flex space-x-2";
      tdAction.setAttribute("data-label", "Actions");
      tdAction.innerHTML = `
        <button class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600" onclick="editRecord(${index})">Edit</button>
        <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="deleteRecord(${index})">Delete</button>
      `;
      tr.appendChild(tdAction);
      tableBody.appendChild(tr);
    });
    console.log('Table Rendered:', currentData.length, 'rows');
  }

  // Save Record
  saveBtn.addEventListener("click", () => {
    const inputs = dynamicForm.querySelectorAll("input");
    const newRecord = {};
    inputs.forEach(input => {
      newRecord[input.dataset.field] = input.value;
    });

    if (editIFSC) {
      const index = currentData.findIndex(item => 
        (selectedBank === "hdfc" ? item.IFSC : item["IFSC Code "]) === editIFSC
      );
      currentData[index] = newRecord;
    } else {
      currentData.push(newRecord);
    }

    if (selectedBank === "hdfc") {
      hdfcData = currentData;
    } else {
      jkData = currentData;
    }

    editIFSC = null;
    renderDashboard();
    dynamicForm.querySelectorAll("input").forEach(input => (input.value = ""));
    console.log('Record Saved:', newRecord);
  });

  // Edit Record
  window.editRecord = (index) => {
    const record = currentData[index];
    editIFSC = selectedBank === "hdfc" ? record.IFSC : record["IFSC Code "];
    dynamicForm.querySelectorAll("input").forEach(input => {
      input.value = record[input.dataset.field] || "";
    });
    console.log('Editing Record:', record);
  };

  // Delete Record
  window.deleteRecord = (index) => {
    if (confirm("Are you sure you want to delete this record?")) {
      currentData.splice(index, 1);
      if (selectedBank === "hdfc") {
        hdfcData = currentData;
      } else {
        jkData = currentData;
      }
      renderDashboard();
      console.log('Record Deleted at Index:', index);
    }
  };
});
