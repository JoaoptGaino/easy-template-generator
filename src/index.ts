#!/usr/bin/env node
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";
import { CliOptions } from "./interfaces/types";

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
});
