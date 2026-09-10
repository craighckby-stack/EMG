/**
 * File: test_splice2.js
 * Description: Header file inclusion preprocessor utility for substituting include directives with file contents.
 */

'use strict';

/**
 * Replaces C-style include directives with corresponding project file contents.
 * 
 * @param {string} sourceCode - The source code containing include directives.
 * @param {Record<string, string>} files - Map of filename keys to file content values.
 * @returns {string} The processed source code with spliced header definitions.
 */
function spliceIncludes(sourceCode, files) {
    if (typeof sourceCode !== 'string' || !files || typeof files !== 'object') {
        throw new TypeError('Invalid arguments provided to spliceIncludes');
    }

    return sourceCode.replace(/#include\s+"([^"]+)"/g, (match, includePath) => {
        if (!includePath || typeof includePath !== 'string') {
            return match;
        }

        const basename = includePath.split('/').pop();
        if (basename && Object.prototype.hasOwnProperty.call(files, basename)) {
            return `// Spliced ${includePath}\n${files[basename]}`;
        }

        return match;
    });
}

function run() {
    const code = '#include "types.h"\nint main() { return 0; }';
    const projectFiles = { 'types.h': 'typedef int i32;' };

    try {
        const optimizedCode = spliceIncludes(code, projectFiles);
        console.log(optimizedCode);
    } catch (error) {
        console.error('Error processing splice files:', error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    }
}

if (require.main === module) {
    run();
}

module.exports = { spliceIncludes };