import fs from 'fs';
import path from 'path';

const dataDirectory = path.join(process.cwd(), 'data');

export function getProblems() {
  const fullPath = path.join(dataDirectory, 'problems.json');
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(fileContents);
}

export function updateProblemStatus(id, status) {
  const problems = getProblems();
  const problemIndex = problems.findIndex(p => p.id === id);
  if (problemIndex > -1) {
    problems[problemIndex].status = status;
    const fullPath = path.join(dataDirectory, 'problems.json');
    fs.writeFileSync(fullPath, JSON.stringify(problems, null, 2));
    return problems[problemIndex];
  }
  return null;
}

export function getProblemById(id) {
    const problems = getProblems();
    return problems.find(p => p.id === id);
}
