/**
 * Module extract includes from C source strings.
 */

const sourceCode = '#include "types.h"\n#include "pk_fsm.h"\nint main() { return 0; }';
const INCLUDE_PATTERN = /#include\s+"([^"]+)"/g;

function extractIncludes(code) {
    if (typeof code !== 'string') {
        throw new TypeError('Input source code must be a string.');
    }
    const includes = [];
    let match;
    while ((match = INCLUDE_PATTERN.exec(code)) !== null) {
        if (match[1]) {
            includes.push(match[1]);
        }
    }
    return includes;
}

try {
    const headerFiles = extractIncludes(sourceCode);
    console.log(headerFiles);
} catch (error) {
    console.error('Failed to extract header includes:', error instanceof Error ? error.message : String(error));
}