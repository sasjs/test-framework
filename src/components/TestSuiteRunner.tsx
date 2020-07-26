import React, { useEffect, useState, ReactElement } from "react";
import TestSuiteComponent from "./TestSuite";
import { TestSuite, Test } from "../types";
import "./TestSuiteRunner.scss";

interface TestSuiteRunnerProps {
  testSuites: TestSuite[];
}
const TestSuiteRunner = (
  props: TestSuiteRunnerProps
): ReactElement<TestSuiteRunnerProps> => {
  const testSuites = props.testSuites || [];
  const [runTests, setRunTests] = useState(false);
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
    if (runTests) {
      setCompletedTestSuites([]);
    }
  }, [runTests, testSuites]);

  return (
    <div>
      <div className="button-container">
        <button
          className={runTests ? "submit-button disabled" : "submit-button"}
          onClick={() => setRunTests(true)}
          disabled={runTests}
        >
          {runTests ? (
            <div>
              <div className="loading-spinner"></div>Running tests...
            </div>
          ) : (
            "Run tests!"
          )}
        </button>
      </div>
      {testSuites.map((testSuite, index) => {
        return (
          <TestSuiteComponent
            key={index}
            {...testSuite}
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
              const newCompletedTestSuites = [
                ...completedTestSuites,
                { name, completedTests }
              ];
              setCompletedTestSuites(newCompletedTestSuites);

              if (newCompletedTestSuites.length === testSuites.length) {
                setRunTests(false);
              }
            }}
          />
        );
      })}
    </div>
  );
};

export default TestSuiteRunner;
