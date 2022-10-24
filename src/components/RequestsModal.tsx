import React, {
  ReactElement,
  ReactNode,
  useState,
  useContext,
  useEffect
} from 'react'
import { Modal, Accordion, Tab, Icon } from 'semantic-ui-react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import moment from 'moment'
import './syntax-highlighting.css'
import './RequestsModal.scss'
import { AppContext } from '../context/AppContext'
import { SASjsRequest } from '@sasjs/adapter'

interface RequestsModalProps {
  trigger: ReactNode
}

const decodeHtml = (encodedString: string): string => {
  const tempElement = document.createElement('textarea')
  tempElement.innerHTML = encodedString
  return tempElement.value
}

const RequestsModal = (
  props: RequestsModalProps
): ReactElement<RequestsModalProps> => {
  const { trigger } = props
  const { adapter } = useContext(AppContext)
  const [requests, setRequests] = useState<SASjsRequest[]>([])
  const config = adapter.getSasjsConfig()
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    setRequests(adapter.getSasRequests())
  }, [])

  return (
    <Modal
      basic
      onOpen={() => setRequests(adapter.getSasRequests())}
      closeIcon
      trigger={trigger}
      size="fullscreen"
      className="requests-modal"
    >
      <Modal.Header>{config.debug ? 'Last 20 requests' : ''}</Modal.Header>
      <Modal.Content>
        {config.debug ? (
          requests && requests.length ? (
            <Accordion inverted className="requests-accordion">
              {requests.map((request, index) => {
                return (
                  <div key={index}>
                    <Accordion.Title
                      className="requests-accordion-title"
                      active={activeIndex === index}
                      index={index}
                      onClick={() =>
                        setActiveIndex(activeIndex === index ? -1 : index)
                      }
                    >
                      {`${request.serviceLink}  `}
                      <span className="request-timestamp">
                        {moment(request.timestamp).format(
                          'dddd, MMMM Do YYYY, h:mm:ss a'
                        )}
                        {` (${moment(request.timestamp).fromNow()})`}
                      </span>
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === index}>
                      <div className="requests-item">
                        <Tab
                          className="request-tabs"
                          renderActiveOnly
                          style={{ width: '100%' }}
                          menu={{
                            fluid: true,
                            secondary: true,
                            inverted: true
                          }}
                          panes={[
                            {
                              menuItem: 'Log',
                              render: () => (
                                <SyntaxHighlighter language="html">
                                  {decodeHtml(request.logFile)}
                                </SyntaxHighlighter>
                              )
                            },
                            {
                              menuItem: 'Source Code',
                              render: () => (
                                <SyntaxHighlighter language="sas">
                                  {decodeHtml(request.sourceCode)}
                                </SyntaxHighlighter>
                              )
                            },
                            {
                              menuItem: 'Generated Code',
                              render: () => (
                                <SyntaxHighlighter language="sas">
                                  {decodeHtml(request.generatedCode)}
                                </SyntaxHighlighter>
                              )
                            }
                          ]}
                        />
                      </div>
                    </Accordion.Content>
                  </div>
                )
              })}
            </Accordion>
          ) : (
            <div className="debug-message">
              <Icon name="bug" size="huge" inverted />
              <h3>There are no requests available.</h3>
              <span>Please run a test and check again.</span>
            </div>
          )
        ) : (
          <div className="debug-message">
            <Icon name="bug" size="huge" inverted />
            <h3>There is no debug information available.</h3>
            <span>Please turn on debug and re-run your tests.</span>
          </div>
        )}
      </Modal.Content>
    </Modal>
  )
}

export default React.memo(RequestsModal)
