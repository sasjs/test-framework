import React, { useState, ReactElement } from "react";
import TestSuiteComponent from "./TestSuite";
import { TestSuite } from "../types";
import "./TestSuiteRunner.scss";

interface TestSuiteRunnerProps {
  testSuites: TestSuite[];
}

const TestSuiteRunner = (
  props: TestSuiteRunnerProps
): ReactElement<TestSuiteRunnerProps> => {
  let testSuites = props.testSuites || [];
  const [runTests, setRunTests] = useState(false);
  const [completedTestSuiteCount, setCompletedTestSuiteCount] = useState(0);

  return (
    <div>
      <div className="button-container">
        <button
          className={runTests ? "submit-button disabled" : "submit-button"}
          onClick={() => {
            setRunTests(true);
            setCompletedTestSuiteCount(0);
          }}
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
            onCompleted={() => {
              setCompletedTestSuiteCount((c) => c + 1);

              if (completedTestSuiteCount + 1 === testSuites.length) {
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
