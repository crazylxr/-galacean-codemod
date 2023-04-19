const assert = require("assert");
const fs = require("fs");
const mockFs = require("mock-fs");
const {
  updateCodeFiles,
  updatePackageJson,
  getLatestVersion,
} = require("../src/updatePackages");
const packages = require("../src/packageReplacements.json");

describe("updatePackages", () => {
  afterEach(() => {
    mockFs.restore();
  });

  it("updateCodeFiles should update imports with new package names", () => {
    mockFs({
      "./src": {
        "file1.js":
          'import { Engine } from "oasis-engine";\nimport { Physics } from "@oasis-engine/physics-physx";',
      },
    });

    const dirPath = "./src";
    updateCodeFiles(dirPath, packages);
    const updatedContent = fs.readFileSync("./src/file1.js", "utf-8");
    const expectedContent =
      'import { Engine } from "@galacean/engine";\nimport { Physics } from "@galacean/engine-physics-physx";';
    assert.strictEqual(
      updatedContent,
      expectedContent,
      "updateCodeFiles should update imports with new package names"
    );
  });

  it("updatePackageJson should update dependencies with new package names and versions", async function () {
    this.timeout(20000);
    mockFs({
      "./package.json": JSON.stringify({
        dependencies: {
          "oasis-engine": "0.4.0",
        },
      }),
    });

    const packageJsonPath = "./package.json";
    await updatePackageJson(packageJsonPath, packages);
    const updatedPackageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, "utf-8")
    );

    const expectedDependencies = {
      "@galacean/engine": `^${await getLatestVersion("@galacean/engine")}`,
    };

    assert.deepStrictEqual(
      updatedPackageJson.dependencies,
      expectedDependencies,
      "updatePackageJson should update dependencies with new package names and versions"
    );
  });
});
