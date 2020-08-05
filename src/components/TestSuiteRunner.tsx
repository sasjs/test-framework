import React, { useState, ReactElement, useEffect } from "react";
import { Button, Icon } from "semantic-ui-react";
import TestSuiteComponent from "./TestSuite";
import { TestSuite, Test } from "../types";
import "semantic-ui-css/semantic.min.css";
import "./TestSuiteRunner.scss";
import ControlBar from "./ControlBar";
import TestSuiteCard from "./TestSuiteCard";
import { runTest } from "../utils/runTest";

interface TestSuiteRunnerProps {
  testSuites: TestSuite[];
}

const TestSuiteRunner = (
  props: TestSuiteRunnerProps
): ReactElement<TestSuiteRunnerProps> => {
  let testSuites = props.testSuites || [];
  const [runTests, setRunTests] = useState(false);
  const [currentTestSuite, setCurrentTestSuite] = useState<TestSuite | null>(
    null
  );
  const [completedTestSuiteCount, setCompletedTestSuiteCount] = useState(0);
  const [completedTestSuites, setCompletedTestSuites] = useState<
    {
      name: string;
      completedTests: {
        test: Test;
        result: boolean;
        error: Error | null;
        executionTime: number;
      }[];
    }[]
  >([]);

  useEffect(() => {
    if (testSuites && testSuites.length) {
      setCurrentTestSuite(testSuites[0]);
    }
  }, [testSuites]);

  return (
    <div>
      <ControlBar />
      <div className="button-container">
        {runTests ? (
          <Button primary loading size="massive">
            Running tests...
          </Button>
        ) : (
          <Button
            icon
            labelPosition="left"
            primary
            size="massive"
            onClick={() => {
              setRunTests(true);
              setCompletedTestSuiteCount(0);
            }}
          >
            <Icon name="play" />
            Run Tests
          </Button>
        )}
      </div>
      <div className="test-suites">
        {completedTestSuites.map((completedTestSuite, index) => {
          return (
            <TestSuiteCard
              key={index}
              tests={completedTestSuite.completedTests}
              name={completedTestSuite.name}
              onRerun={() => {}}
              onRerunTest={async (test) => {
                let context;
                const originalTestSuite = testSuites.find(
                  (t) => t.name === completedTestSuite.name
                );
                if (originalTestSuite?.beforeAll) {
                  context = await originalTestSuite.beforeAll();
                }
                const executionResult = await runTest(test, context);
                console.log(executionResult);
              }}
            />
          );
        })}
        {!!currentTestSuite && runTests && (
          <TestSuiteComponent
            {...currentTestSuite}
            isRunning={runTests}
            onCompleted={(
              name,
              completedTests: {
                test: Test;
                result: boolean;
                error: Error | null;
                executionTime: number;
              }[]
            ) => {
              setCompletedTestSuiteCount((c) => c + 1);
              const newCompletedTestSuites = [
                ...completedTestSuites,
                { name, completedTests }
              ];
              setCompletedTestSuites(newCompletedTestSuites);
              const currentIndex = testSuites.indexOf(currentTestSuite);
              const nextTestSuite =
                currentIndex === testSuites.length - 1
                  ? null
                  : testSuites[currentIndex + 1];
              setCurrentTestSuite(nextTestSuite);

              if (completedTestSuiteCount + 1 === testSuites.length) {
                setRunTests(false);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TestSuiteRunner;
