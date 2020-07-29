import React, { ReactElement, useContext, useState, useEffect } from "react";
import { Menu, Checkbox, Input, Popup, Button } from "semantic-ui-react";
import { AppContext } from "../context/AppContext";
import RequestsModal from "./RequestsModal";
import "./ControlBar.scss";

const ControlBar = (): ReactElement<{}> => {
  const { adapter, config } = useContext(AppContext);
  const [appLoc, setAppLoc] = useState("");
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    if (adapter) {
      adapter.setDebugState(debug);
    }
  }, [debug, adapter, config]);

  useEffect(() => {
    if (appLoc && adapter) {
      adapter.setSASjsConfig({ ...adapter.getSasjsConfig(), appLoc });
    }
  }, [appLoc, adapter]);

  useEffect(() => {
    setAppLoc(adapter.getSasjsConfig().appLoc);
  }, [adapter]);

  return (
    <Menu attached="top" inverted color="blue" className="control-bar">
      <Menu.Item>
        <Popup
          inverted
          content="Toggle debug mode"
          trigger={
            <Checkbox toggle onChange={(_, data) => setDebug(!!data.checked)} />
          }
        />
      </Menu.Item>
      <Menu.Item>
        <Input
          placeholder="App loc"
          value={appLoc}
          onChange={(_, data) => setAppLoc(data.value)}
        />
      </Menu.Item>
      <Menu.Menu position="right">
        <RequestsModal trigger={<Button>Requests</Button>} />
      </Menu.Menu>
    </Menu>
  );
};

export default ControlBar;
