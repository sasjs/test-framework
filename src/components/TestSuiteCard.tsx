import React, { ReactElement } from 'react'
import './TestSuiteCard.scss'
import { Test } from '../types'
import TestCard from './TestCard'

interface TestSuiteCardProps {
  name: string
  tests: {
    test: Test
    isRunning?: boolean
    result: boolean
    error: Error | null
    executionTime: number | null
  }[]
  onRerun: () => void
  onRerunTest: (test: Test) => void
}
const TestSuiteCard = (
  props: TestSuiteCardProps
): ReactElement<TestSuiteCardProps> => {
  const { name, tests, onRerun, onRerunTest } = props
  const overallStatus = tests.map((t) => t.result).reduce((x, y) => x && y)
  const isSuiteRunning = tests.map((t) => t.isRunning).reduce((x, y) => x || y)

  return (
    <div className="test-suite">
      <div
        className={`test-suite-name ${
          isSuiteRunning ? 'running' : overallStatus ? 'passed' : 'failed'
        }`}
      >
        {name}
        <button
          className={`re-run-button ${isSuiteRunning ? 'disabled' : ''}`}
          onClick={onRerun}
        >
          {isSuiteRunning ? 'Running' : 'Re-run'}
        </button>
      </div>
      {tests.map((completedTest, index) => {
        const { test, result, error, executionTime, isRunning } = completedTest
        const { title, description } = test
        return (
          <TestCard
            key={index}
            title={title}
            onRerun={() => onRerunTest(test)}
            description={description}
            status={
              isRunning ? 'running' : result === true ? 'passed' : 'failed'
            }
            error={error}
            executionTime={executionTime}
          />
        )
      })}
    </div>
  )
}

export default TestSuiteCard
