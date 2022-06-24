import React, { ReactElement, useState, useEffect } from 'react'
import './TestSuiteCard.scss'
import { Test } from '../types'
import TestComponent from './Test'
import TestCard from './TestCard'
// import TestSuiteCard from "./TestSuiteCard";

interface TestSuiteProps {
  name: string
  tests: Test[]
  isRunning: boolean
  beforeAll?: (...args: any) => Promise<any>
  afterAll?: (...args: any) => Promise<any>
  onCompleted: (
    name: string,
    completedTests: {
      test: Test
      result: boolean
      error: Error | null
      executionTime: number
    }[]
  ) => void
}
const TestSuite = (props: TestSuiteProps): ReactElement<TestSuiteProps> => {
  const { name, tests, beforeAll, afterAll, onCompleted } = props
  const [context, setContext] = useState<any>(null)
  // const [running, setRunning] = useState<boolean>(false);
  // const [isSingleTest, setIsSingleTest] = useState<boolean>(false);
  const [completedTests, setCompletedTests] = useState<
    {
      test: Test
      result: boolean
      error: Error | null
      executionTime: number
    }[]
  >([])
  const [currentTest, setCurrentTest] = useState<Test | null>(
    null as unknown as Test
  )

  useEffect(() => {
    if (beforeAll) {
      beforeAll().then((data) => setContext({ data }))
    }
  }, [beforeAll])

  // useEffect(() => {
  //   setRunning(isRunning);
  // }, [isRunning]);

  useEffect(() => {
    if (tests.length) {
      setCurrentTest(tests[0])
    }
    setCompletedTests([])
    setContext(null)
  }, [tests])

  // if (!running && completedTests.length) {
  //   return (
  //     <TestSuiteCard
  //       tests={completedTests}
  //       name={name}
  //       onRerunTest={(test: Test) => {
  //         const newCompleteTests = completedTests.filter(
  //           (t) => t.test !== test
  //         );
  //         setCompletedTests(newCompleteTests);
  //         setCurrentTest(test);
  //         setRunning(true);
  //         setIsSingleTest(true);
  //       }}
  //       onRerun={() => {
  //         setCompletedTests([]);
  //         setRunning(true);
  //         setContext(null);
  //         if (beforeAll) {
  //           beforeAll().then((data) => setContext({ data }));
  //         }
  //         if (tests.length) {
  //           setCurrentTest(tests[0]);
  //         }
  //       }}
  //     />
  //   );
  // }

  return (!!beforeAll && !!context) || !beforeAll ? (
    <div className="test-suite">
      <div className="test-suite-name running">{name}</div>
      {currentTest && (
        <TestComponent
          {...currentTest}
          context={context}
          onRerun={() => {
            const newCompleteTests = completedTests.filter(
              (t) => t.test.title !== currentTest.title
            )
            setCompletedTests(newCompleteTests)
            setCurrentTest(currentTest)
          }}
          onCompleted={(completedTest) => {
            const newCompleteTests = [
              {
                test: currentTest,
                result: completedTest.result,
                error: completedTest.error,
                executionTime: completedTest.executionTime
              },
              ...completedTests
            ]
            setCompletedTests(newCompleteTests)
            // if (!isSingleTest) {
            const currentIndex = tests.indexOf(currentTest)
            const nextIndex =
              currentIndex < tests.length - 1 ? currentIndex + 1 : -1
            if (nextIndex >= 0) {
              setCurrentTest(tests[nextIndex])
            } else {
              setCurrentTest(null)
            }
            // }
            if (newCompleteTests.length === tests.length) {
              if (afterAll) {
                afterAll().then(() => {
                  // setRunning(false);
                  onCompleted(name, newCompleteTests)
                })
              } else {
                // setRunning(false);
                onCompleted(name, newCompleteTests)
              }
            }
          }}
        />
      )}
      {completedTests.map((completedTest, index) => {
        const { test, result, error } = completedTest
        const { title, description } = test
        return (
          <TestCard
            key={index}
            onRerun={() => {
              const newCompleteTests = completedTests.filter(
                (t) => t.test !== currentTest
              )
              setCompletedTests(newCompleteTests)
              setCurrentTest(currentTest)
            }}
            title={title}
            description={description}
            status={result === true ? 'passed' : 'failed'}
            error={error}
          />
        )
      })}
    </div>
  ) : (
    <div />
  )
}

export default TestSuite
