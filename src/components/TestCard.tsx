import React, { ReactElement } from 'react'
import './TestCard.scss'

interface TestCardProps {
  title: string
  description: string
  status: string
  error: Error | null
  executionTime?: number | null
  onRerun?: () => void
}
const TestCard = (props: TestCardProps): ReactElement<TestCardProps> => {
  const { title, description, status, error, executionTime, onRerun } = props

  return (
    <div className="test">
      <div>
        <code className="title">{title}</code>
        {!!onRerun && (
          <button
            className={`re-run-button ${
              status === 'running' ? 'disabled' : ''
            }`}
            onClick={onRerun}
          >
            {status === 'running' ? 'Running' : 'Re-run'}
          </button>
        )}
      </div>
      <span className="description">{description}</span>
      <span className="execution-time">
        {executionTime ? executionTime.toFixed(2) + 's' : ''}
      </span>
      {status === 'running' && (
        <div>
          <span className="icon running"></span>Running...
        </div>
      )}
      {status === 'passed' && (
        <div>
          <span className="icon passed"></span>Passed
        </div>
      )}
      {status === 'failed' && (
        <div>
          <div>
            <span className="icon failed"></span>Failed
          </div>
          {!!error && <code>{error.message}</code>}
        </div>
      )}
    </div>
  )
}

export default TestCard
