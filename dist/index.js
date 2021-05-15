#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const shelljs_1 = __importDefault(require("shelljs"));
const template_1 = require("./utils/template");
const CHOICES = fs_1.default.readdirSync(path_1.default.join(__dirname, "templates"));
const QUESTIONS = [
    {
        name: "template",
        type: "list",
        message: "Which template would you like to use?",
        choices: CHOICES,
    },
    {
        name: "name",
        type: "input",
        message: "Name of the project: ",
    },
];
const CURRENT_DIR = process.cwd();
function createProject(projectPath) {
    if (fs_1.default.existsSync(projectPath)) {
        console.log(chalk_1.default.red(`Folder ${projectPath} exists. Please, use another name.`));
        return false;
    }
    fs_1.default.mkdirSync(projectPath);
    return true;
}
inquirer_1.default.prompt(QUESTIONS).then((answers) => {
    const projectChoice = answers["template"];
    const projectName = answers["name"];
    const templatePath = path_1.default.join(__dirname, "templates", projectChoice);
    const targetPath = path_1.default.join(CURRENT_DIR, projectName);
    const options = {
        projectName,
        templateName: projectChoice,
        templatePath,
        targetPath,
    };
    console.log(options);
    if (!createProject(targetPath)) {
        return;
    }
    createDirectoryContents(templatePath, projectName);
});
const SKIP_FILES = ["node_modules", ".template.json"];
function createDirectoryContents(templatePath, projectName) {
    const filesToCreate = fs_1.default.readdirSync(templatePath);
    filesToCreate.forEach((file) => {
        const originFilepath = path_1.default.join(templatePath, file);
        const stats = fs_1.default.statSync(originFilepath);
        if (SKIP_FILES.indexOf(file) > -1)
            return;
        if (stats.isFile()) {
            let contents = fs_1.default.readFileSync(originFilepath, "utf8");
            contents = template_1.render(contents, { projectName });
            const writePath = path_1.default.join(CURRENT_DIR, projectName, file);
            fs_1.default.writeFileSync(writePath, contents, "utf8");
        }
        else if (stats.isDirectory()) {
            fs_1.default.mkdirSync(path_1.default.join(CURRENT_DIR, projectName, file));
            createDirectoryContents(path_1.default.join(templatePath, file), path_1.default.join(projectName, file));
        }
    });
}
function postProcess(options) {
    const isNode = fs_1.default.existsSync(path_1.default.join(options.templatePath, "package.json"));
    if (isNode) {
        shelljs_1.default.cd(options.targetPath);
        const result = shelljs_1.default.exec("yarn");
        if (result.code !== 0) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=index.js.map