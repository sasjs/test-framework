import React, { useState, ReactElement, useEffect, useCallback } from "react";
import { Button, Icon } from "semantic-ui-react";
import { produce } from "immer";
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
        executionTime: number | null;
        isRunning?: boolean;
      }[];
    }[]
  >([]);

  useEffect(() => {
    if (testSuites && testSuites.length) {
      setCurrentTestSuite(testSuites[0]);
    }
  }, [testSuites]);

  const resetTestResults = useCallback(
    (
      testSuiteIndex,
      testIndex,
      completedTestSuite: {
        name: string;
        completedTests: {
          test: Test;
          result: boolean;
          error: Error | null;
          isRunning?: boolean;
          executionTime: number | null;
        }[];
      }
    ) => {
      const newCompletedTestSuite = produce(completedTestSuite, (draft) => {
        draft.completedTests[testIndex] = {
          ...draft.completedTests[testIndex],
          isRunning: true,
          executionTime: null
        };
      });
      const newCompletedTestSuites = produce(completedTestSuites, (draft) => {
        draft[testSuiteIndex] = newCompletedTestSuite;
      });
      setCompletedTestSuites(newCompletedTestSuites);
    },
    [completedTestSuites]
  );

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
                const testIndex = completedTestSuite.completedTests.findIndex(
                  (t) => t.test.title === test.title
                );
                resetTestResults(index, testIndex, completedTestSuite);
                const originalTestSuite = testSuites.find(
                  (t) => t.name === completedTestSuite.name
                );

                const executionResult = await executeTest(
                  originalTestSuite!,
                  test
                );
                const newCompletedTestSuite = produce(
                  completedTestSuite,
                  (draft) => {
                    draft.completedTests[testIndex] = {
                      ...draft.completedTests[testIndex],
                      ...executionResult
                    };
                  }
                );
                const newCompletedTestSuites = produce(
                  completedTestSuites,
                  (draft) => {
                    draft[index] = newCompletedTestSuite;
                  }
                );
                setCompletedTestSuites(newCompletedTestSuites);
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

const executeTest = async (testSuite: TestSuite, test: Test) => {
  let context;

  if (testSuite?.beforeAll) {
    context = await testSuite.beforeAll();
  }
  const executionResult = await runTest(test, context);

  return executionResult;
};

export default TestSuiteRunner;
