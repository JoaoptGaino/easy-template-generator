#!/usr/bin/env node
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import shell from "shelljs";
import { CliOptions } from "./interfaces/types";
import { render } from "./utils/template";

const CHOICES = fs.readdirSync(path.join(__dirname, "templates"));

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

function createProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    console.log(
      chalk.red(`Folder ${projectPath} exists. Please, use another name.`)
    );
    return false;
  }
  fs.mkdirSync(projectPath);
  return true;
}

inquirer.prompt(QUESTIONS).then((answers) => {
  const projectChoice = answers["template"];
  const projectName = answers["name"];
  const templatePath = path.join(__dirname, "templates", projectChoice);
  const targetPath = path.join(CURRENT_DIR, projectName);
  const options: CliOptions = {
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
function createDirectoryContents(templatePath: string, projectName: string) {
  const filesToCreate = fs.readdirSync(templatePath);
  filesToCreate.forEach((file) => {
    const originFilepath = path.join(templatePath, file);
    const stats = fs.statSync(originFilepath);
    if (SKIP_FILES.indexOf(file) > -1) return;

    if (stats.isFile()) {
      let contents = fs.readFileSync(originFilepath, "utf8");
      contents = render(contents, { projectName });
      const writePath = path.join(CURRENT_DIR, projectName, file);
      fs.writeFileSync(writePath, contents, "utf8");
    } else if (stats.isDirectory()) {
      fs.mkdirSync(path.join(CURRENT_DIR, projectName, file));
      createDirectoryContents(
        path.join(templatePath, file),
        path.join(projectName, file)
      );
    }
  });
}
function postProcess(options: CliOptions) {
  const isNode = fs.existsSync(path.join(options.templatePath, "package.json"));
  if (isNode) {
    shell.cd(options.targetPath);
    const result = shell.exec("yarn");
    if (result.code !== 0) {
      return false;
    }
  }
  return true;
}
