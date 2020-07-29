import React, { useState, ReactElement } from "react";
import { Button, Icon } from "semantic-ui-react";
import TestSuiteComponent from "./TestSuite";
import { TestSuite } from "../types";
import "semantic-ui-css/semantic.min.css";
import "./TestSuiteRunner.scss";
import ControlBar from "./ControlBar";

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
    </div>
  );
};

export default TestSuiteRunner;
