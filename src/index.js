const { updateCodeFiles, updatePackageJson } = require("./updatePackages");

const base = process.cwd();
const srcDirPath = base + "/src";
const packageJsonPath = base + "/package.json";
const packages = require("./packageReplacements.json");

// 更新代码文件中的 import 语句
updateCodeFiles(srcDirPath, packages);

// 更新 package.json 文件中的依赖
updatePackageJson(packageJsonPath, packages);
