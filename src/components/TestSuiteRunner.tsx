import React, { useState, ReactElement, useEffect, useCallback } from "react";
import { Button, Icon } from "semantic-ui-react";
import { produce } from "immer";
import TestSuiteComponent from "./TestSuite";
import { TestSuite, Test } from "../types";
import "./TestSuiteRunner.scss";
import ControlBar from "./ControlBar";
import TestSuiteCard from "./TestSuiteCard";
import { runTest } from "../utils/runTest";
import { Helmet } from "react-helmet";

interface TestSuiteRunnerProps {
  testSuites: TestSuite[];
}

async function asyncForEach(array: any[], callback: (...args: any[]) => any) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
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

  const resetTestSuiteResults = useCallback(
    (testSuiteIndex) => {
      const newCompletedTestSuites = produce(completedTestSuites, (draft) => {
        draft[testSuiteIndex].completedTests.forEach((test) => {
          test.isRunning = true;
          test.executionTime = null;
        });
      });
      setCompletedTestSuites(newCompletedTestSuites);
    },
    [completedTestSuites]
  );

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

  const rerunTest = useCallback(
    async (
      test,
      testSuiteIndex,
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
      const testIndex = completedTestSuite.completedTests.findIndex(
        (t) => t.test.title === test.title
      );
      const originalTestSuite = testSuites.find(
        (t) => t.name === completedTestSuite.name
      );
      const executionResult = await executeTest(originalTestSuite!, test);
      const newCompletedTestSuite = produce(completedTestSuite, (draft) => {
        draft.completedTests[testIndex] = {
          ...draft.completedTests[testIndex],
          ...executionResult,
          isRunning: false
        };
      });
      const newCompletedTestSuites = produce(completedTestSuites, (draft) => {
        draft[testSuiteIndex] = newCompletedTestSuite;
      });
      setCompletedTestSuites(newCompletedTestSuites);
    },
    [completedTestSuites]
  );

  const rerunTestSuite = useCallback(
    async (
      testSuiteIndex: number,
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
      const originalTestSuite = testSuites.find(
        (t) => t.name === completedTestSuite.name
      );
      const newCompletedTests: {
        test: Test;
        result: boolean;
        error: Error | null;
        isRunning?: boolean;
        executionTime: number | null;
      }[] = [];

      await asyncForEach(
        completedTestSuite.completedTests,
        async (completedTest: {
          test: Test;
          result: boolean;
          error: Error | null;
          isRunning?: boolean;
          executionTime: number | null;
        }) => {
          const result = await executeTest(
            originalTestSuite!,
            completedTest.test
          );
          newCompletedTests.push({
            ...completedTest,
            ...result,
            isRunning: false
          });

          const newCompletedTestSuite = produce(completedTestSuite, (draft) => {
            draft.completedTests = newCompletedTests;
          });
          const newCompletedTestSuites = produce(
            completedTestSuites,
            (draft) => {
              draft[testSuiteIndex] = newCompletedTestSuite;
            }
          );
          setCompletedTestSuites(newCompletedTestSuites);
        }
      );
    },
    [completedTestSuites]
  );

  return (
    <div>
      <Helmet>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css"
        />
      </Helmet>
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
              onRerun={async () => {
                resetTestSuiteResults(index);
                await rerunTestSuite(index, completedTestSuite);
              }}
              onRerunTest={async (test) => {
                const testIndex = completedTestSuite.completedTests.findIndex(
                  (t) => t.test.title === test.title
                );
                resetTestResults(index, testIndex, completedTestSuite);

                await rerunTest(test, index, completedTestSuite);
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
  const executionResult = await runTest(test, { data: context });

  return executionResult;
};

export default TestSuiteRunner;
