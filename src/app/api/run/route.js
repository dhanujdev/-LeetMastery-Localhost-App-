import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { getProblemById } from '@/lib/data';

export async function POST(req) {
    try {
        const { code, language, problemId } = await req.json();

        // Safety check
        if (language !== 'python') {
            return NextResponse.json({ error: 'Only Python is supported.' }, { status: 400 });
        }

        const problem = getProblemById(problemId);
        if (!problem || !problem.testCases) {
            // Fallback to simple run if no test cases
            return executeSimpleRun(code);
        }

        // Construct the Test Harness
        // This Python script combines user code + test runner logic
        const testScript = `
import sys
import json
import inspect

# --- User Code Start ---
${code}
# --- User Code End ---

def run_tests():
    results = []
    test_cases = ${JSON.stringify(problem.testCases)}
    
    passed_count = 0

    # Find the user's function in globals()
    # We look for the last function defined that is NOT run_tests or standard library stuff
    user_func = None

    # Get all functions in global scope
    # Note: In this script, 'code' has already run at top level.
    # So 'twoSum' or whatever function name is already defined.
    
    # We can try to match by name if we parse it, but dynamic is better.
    # We'll filter for functions that are defined in this file (main script)
    candidates = []
    for name, obj in globals().items():
        if inspect.isfunction(obj) and name != 'run_tests' and obj.__module__ == '__main__':
             candidates.append(obj)
    
    # Heuristic: The user's function is likely the last one defined or the only one.
    if candidates:
        user_func = candidates[-1]

    if not user_func:
         print(json.dumps({"summary": "Error", "details": [{"case": 0, "status": "Error", "message": "No function found. Please define a function."}]}))
         return

    
    for i, case in enumerate(test_cases):
        try:
            # Parse inputs
            input_setup = case['input'] 
            
            # Create a local scope to evaluate the input setup string (e.g. "nums = [2,7]; target=9")
            input_vars = {}
            exec(input_setup, {}, input_vars)
            
            # Inspect user function signature to match arguments
            sig = inspect.signature(user_func)
            args = []
            for param in sig.parameters:
                if param in input_vars:
                    args.append(input_vars[param])
                else:
                    # If the user defines helper functions or other args not in input, we might fail.
                    # For MVP, we pass None if missing? Or ignore?
                    # Let's assume input string covers all required positional args.
                    pass
            
            # Call the User Function
            output = user_func(*args)
            
            # Compare with expected
            # expected is a string like "[0, 1]". We eval it to get the object.
            expected = eval(case['expected']) 
            
            if output == expected:
                results.append({"case": i, "status": "Passed", "input": case['input'], "output": str(output)})
                passed_count += 1
            else:
                results.append({"case": i, "status": "Failed", "input": case['input'], "expected": str(expected), "got": str(output)})
                
        except Exception as e:
            results.append({"case": i, "status": "Error", "message": str(e)})

    print(json.dumps({"summary": f"{passed_count}/{len(test_cases)} Passed", "details": results}))

if __name__ == "__main__":
    run_tests()
`;

        return executePython(testScript);

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function executeSimpleRun(code) {
    return executePython(code);
}

async function executePython(fullScript) {
    const tempDir = os.tmpdir();
    const fileName = `leetcode_test_${Date.now()}.py`;
    const filePath = path.join(tempDir, fileName);

    await writeFile(filePath, fullScript);

    return new Promise((resolve) => {
        const process = spawn('python3', [filePath]);

        let stdout = '';
        let stderr = '';

        process.stdout.on('data', (data) => stdout += data.toString());
        process.stderr.on('data', (data) => stderr += data.toString());

        process.on('close', async (code) => {
            try { await unlink(filePath); } catch (e) { }
            resolve(NextResponse.json({ stdout, stderr, exitCode: code }));
        });

        setTimeout(() => {
            process.kill();
            resolve(NextResponse.json({ error: 'Timeout' }, { status: 408 }));
        }, 5000);
    });
}
