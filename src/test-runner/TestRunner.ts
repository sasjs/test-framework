import { Test } from "../types";
import chalk from "chalk";
import SASjs from "@sasjs/adapter/node";

export const getConfiguredAdapter = async () => {
    const config = await fetch("config.json").then((res) => res.json());
    console.log(config);
    const sasjs = new SASjs(config.sasJsConfig);
    return sasjs;
}

export const runTest = async (currentTest: Test, context: any) => {
    const { title, beforeTest, afterTest, assertion } = currentTest;

    console.log(chalk.blueBright(`Running test: ${chalk.cyanBright(title)}`));

    const beforeTestFunction = beforeTest ? beforeTest : () => Promise.resolve();
    const afterTestFunction = afterTest ? afterTest : () => Promise.resolve();

    await beforeTestFunction();

    const startTime = new Date().valueOf();
    const response = await test(context);
    const result = assertion(response, context);
    const endTime = new Date().valueOf();
    const executionTime = (endTime - startTime) / 1000;

    console.log(result ? chalk.greenBright(`\u2714 Test passed! [${executionTime.toFixed(2)}s]`) : chalk.redBright(`\u2718 Test failed. [${executionTime.toFixed(2)}s]`));

    await afterTestFunction();

    return !!result;
}