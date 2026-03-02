const fs = require('fs');
const path = require('path');

function printTree(dir, depth = 0, prefix = '') {
    if (depth > 5) return;
    const files = fs.readdirSync(dir);

    files.sort((a, b) => {
        const isDirA = fs.statSync(path.join(dir, a)).isDirectory();
        const isDirB = fs.statSync(path.join(dir, b)).isDirectory();
        if (isDirA && !isDirB) return -1;
        if (!isDirA && isDirB) return 1;
        return a.localeCompare(b);
    });

    // Filter out node_modules and other huge/hidden dirs
    const filteredFiles = files.filter(f => !['node_modules', '.git', 'dist', '.gemini', '.env'].includes(f) && !f.startsWith('.vscode'));

    for (let i = 0; i < filteredFiles.length; i++) {
        const file = filteredFiles[i];
        const isLast = i === filteredFiles.length - 1;
        console.log(prefix + (isLast ? '└── ' : '├── ') + file);

        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            printTree(fullPath, depth + 1, prefix + (isLast ? '    ' : '│   '));
        }
    }
}
console.log('sankalp_scorecard/');
printTree('c:/Users/MohithK/OneDrive/Desktop/sankalp_scorecard');
