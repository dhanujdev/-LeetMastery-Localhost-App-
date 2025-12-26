const path = require('path');
const fs = require('fs');

console.log("Current Directory:", process.cwd());

try {
    const dataDirectory = path.join(process.cwd(), 'data');
    const fullPath = path.join(dataDirectory, 'problems.json');
    console.log("Attempting to read:", fullPath);

    if (!fs.existsSync(fullPath)) {
        console.error("FILE DOES NOT EXIST!");
    } else {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const data = JSON.parse(fileContents);
        console.log("Success! Read", data.length, "problems.");
        console.log("First problem:", data[0].title);
    }
} catch (e) {
    console.error("Exception:", e);
}
