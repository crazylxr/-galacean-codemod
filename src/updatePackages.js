const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function updateCodeFiles(dirPath, packages) {
  const codeFiles = getBllFiles(dirPath);
  codeFiles.forEach((file) => {
    let content = fs.readFileSync(file, { encoding: "utf-8" });
    for (const oldPackage in packages) {
      const regex = new RegExp(`import (.*?) from ['"]${oldPackage}['"]`, "gms");
      content = content.replace(
        regex,
        `import $1 from "${packages[oldPackage]}"`
      );
    }
    fs.writeFileSync(file, content);
  });
}

function getBllFiles(dirPath) {
  return fs.readdirSync(dirPath).reduce((files, file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      return files.concat(getBllFiles(filePath));
    }
    return files.concat(filePath);
  }, []);
}

function updatePackageJson(packageJsonPath, packages) {
  const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, { encoding: "utf-8" })
  );
  for (const depType of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
  ]) {
    const deps = packageJson[depType];
    if (deps) {
      for (const oldPackage in packages) {
        if (deps[oldPackage]) {
          delete deps[oldPackage];
          const newPackage = packages[oldPackage];
          deps[newPackage] = `^${getLatestVersion(newPackage)}`;
        }
      }
    }
  }
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

function getLatestVersion(packageName) {
  const command = `npm show ${packageName} version --json`;
  const output = execSync(command).toString();
  return JSON.parse(output.trim());
}

module.exports = {
  updateCodeFiles,
  getBllFiles,
  updatePackageJson,
  getLatestVersion,
};
