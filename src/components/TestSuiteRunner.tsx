import React, { useEffect, useState, ReactElement } from 'react'
import TestSuiteComponent from './TestSuite'
import TestSuiteCard from './TestSuiteCard'
import { TestSuite, Test } from '../types'
import './TestSuiteRunner.scss'

interface TestSuiteRunnerProps {
  testSuites: TestSuite[]
}
const TestSuiteRunner = (
  props: TestSuiteRunnerProps
): ReactElement<TestSuiteRunnerProps> => {
  const testSuites = props.testSuites || []
  const [runTests, setRunTests] = useState(false)
  const [completedTestSuites, setCompletedTestSuites] = useState<
    {
      name: string
      completedTests: {
        test: Test
        result: boolean
        error: Error | null
        executionTime: number
      }[]
    }[]
  >([])
  const [currentTestSuite, setCurrentTestSuite] = useState<TestSuite | null>(
    (null as unknown) as TestSuite
  )

  useEffect(() => {
    if (testSuites && testSuites.length) {
      setCurrentTestSuite(testSuites[0])
    }
  }, [testSuites])

  useEffect(() => {
    if (runTests) {
      setCompletedTestSuites([])
      if (testSuites && testSuites.length) {
        setCurrentTestSuite(testSuites[0])
      }
    }
  }, [runTests, testSuites])

  return (
    <div>
      <div className='button-container'>
        <button
          className={runTests ? 'submit-button disabled' : 'submit-button'}
          onClick={() => setRunTests(true)}
          disabled={runTests}
        >
          {runTests ? (
            <div>
              <div className='loading-spinner'></div>Running tests...
            </div>
          ) : (
            'Run tests!'
          )}
        </button>
      </div>
      {completedTestSuites.map((completedTestSuite, index) => {
        return (
          <TestSuiteCard
            key={index}
            tests={completedTestSuite.completedTests}
            name={completedTestSuite.name}
          />
        )
      })}
      {currentTestSuite && runTests && (
        <TestSuiteComponent
          {...currentTestSuite}
          onCompleted={(
            name,
            completedTests: {
              test: Test
              result: boolean
              error: Error | null
              executionTime: number
            }[]
          ) => {
            const currentIndex = testSuites.indexOf(currentTestSuite)
            const nextIndex =
              currentIndex < testSuites.length - 1 ? currentIndex + 1 : -1
            if (nextIndex >= 0) {
              setCurrentTestSuite(testSuites[nextIndex])
            } else {
              setCurrentTestSuite(null)
            }
            const newCompletedTestSuites = [
              ...completedTestSuites,
              { name, completedTests }
            ]
            setCompletedTestSuites(newCompletedTestSuites)

            if (newCompletedTestSuites.length === testSuites.length) {
              setRunTests(false)
            }
          }}
        />
      )}
    </div>
  )
}

export default TestSuiteRunner
