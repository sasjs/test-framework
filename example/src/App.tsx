import React from 'react'

import { TestSuiteRunner } from '@sasjs/test-framework'
import '@sasjs/test-framework/dist/index.css'

const App = () => {
  return <TestSuiteRunner testSuites={[]} />
}

export default App
