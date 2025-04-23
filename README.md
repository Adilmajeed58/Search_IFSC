# Search_IFSC
IFSC Code Generator - Jammu and Kashmir Bank
This is a web-based IFSC code generator for Jammu and Kashmir Bank branches. It allows users to select a branch name from a dropdown and retrieve the corresponding IFSC code. The website features a modern, responsive design with a vibrant color scheme, built using HTML, CSS, and JavaScript.
Features

Single Dropdown: Select from 1,014 J&K Bank branches to view their IFSC codes.
Responsive Design: Works seamlessly on desktops, tablets, and mobile devices.
Attractive UI: Clean card-based layout with a blue-teal gradient background, teal and coral buttons, and Poppins typography.
Data Source: Uses a JSON file (ifsc.json) with branch details.
Free Resources: Poppins font via Google Fonts and icons via Font Awesome.

Files

index.html: Main HTML structure with a branch name dropdown and buttons.
styles.css: CSS for the responsive, vibrant design.
script.js: JavaScript to fetch ifsc.json and handle dropdown functionality.
ifsc.json: JSON file with 1,014 branch entries (fields: S.No., Sol Id, Branch Name, Alpha Code, IFSC Code).

Setup Instructions
Prerequisites

A modern web browser (Chrome, Firefox, Safari).
A local server (e.g., VS Code Live Server, Node.js http-server) for testing.
GitHub account for publishing.

Local Setup

Clone or Download:

Clone the repository:
git clone https://github.com/your-username/ifsc-generator.git


Or download and extract the ZIP from GitHub.



Navigate to Directory:
cd ifsc-generator


Run a Local Server:

VS Code Live Server:

Install Visual Studio Code (https://code.visualstudio.com/).
Open the project folder in VS Code.
Install the Live Server extension.
Right-click index.html → "Open with Live Server" (opens at http://localhost:5500).


Node.js http-server:
npm install -g http-server
http-server


Access at http://localhost:8080.




Test the Website:

Open http://localhost:5500 in a browser.
Verify the branch name dropdown lists all branches and displays IFSC codes on selection.



Publishing on GitHub Pages

Create a Repository:
Go to https://github.com and create a new repository (e.g., ifsc-generator).
Initialize with a README (optional).


Upload Files:
Via web interface:

Click "Add file" → "Upload files".
Upload index.html, styles.css, script.js, ifsc.json.
Commit with a message (e.g., "Initial upload").


Via Git:
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/ifsc-generator.git
git push -u origin main




Enable GitHub Pages:
Go to repository → Settings → Pages.
Set Source to "Deploy from a branch", Branch to main, Folder to / (root).
Save and wait 1-5 minutes.


Access the Website:
Visit https://your-username.github.io/ifsc-generator.
Test the dropdown and IFSC code display.



Usage

Open the website (http://localhost:5500 locally or https://your-username.github.io/ifsc-generator online).
Select a branch from the Branch Name dropdown (e.g., "RESIDENCY ROAD SRINAGAR").
Click Get IFSC Code to display the IFSC code (e.g., "JAKA0CHINAR").
Click Reset to clear the selection and result.

Troubleshooting

Empty Dropdown:
Check console (F12 → Console) for errors like "Failed to load ifsc.json".
Ensure ifsc.json is in the root directory and accessible (https://your-username.github.io/ifsc-generator/ifsc.json).
Validate ifsc.json at https://jsonlint.com/.


Design Issues:
Test in Chrome/Firefox for best rendering.
Clear browser cache (Ctrl+Shift+R) if old styles appear.


GitHub Pages Not Live:
Wait 5-10 minutes or check Actions tab for deployment status.
Confirm files are in the repository root.



Credits

Fonts: Poppins via Google Fonts.
Icons: Font Awesome via CDN.
Developed by: [Your Name or "Anonymous"] with assistance from Grok 3 by xAI.

License
This project is unlicensed. Feel free to use and modify as needed.

For issues or contributions, create a GitHub issue or contact [your contact info, if desired].
