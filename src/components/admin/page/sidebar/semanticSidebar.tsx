import * as React from 'react';
import { Menu, Icon, Accordion } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

interface Props {
    visible: boolean;
}

export default class SideMenu extends React.Component<Props, {}> {

  render() {
    return (
            <Accordion styled={true}>
                <Accordion.Title>Metamodel Setup</Accordion.Title>
                <Accordion.Content>
                    <Menu vertical={true} secondary={true} compact={true}>
                        <Menu.Item as={Link} to="/Admin">
                          <span>
                            <Icon name="gamepad" />
                            Meta Objects
                          </span>
                        </Menu.Item>
                        <Menu.Item name="gamepad">
                          <span>
                            <Icon name="gamepad" />
                            Workspaces
                          </span>
                        </Menu.Item>
                        <Menu.Item name="camera">
                          <span>
                            <Icon name="camera" />
                            Workflow
                          </span>
                        </Menu.Item>
                    </Menu>
                </Accordion.Content>
                <Accordion.Title>Workflow Definition</Accordion.Title>
                <Accordion.Content>
                    <Menu vertical={true}>
                        <Menu.Item name="home">
                            <Icon name="home" />
                            Meta Objects
                        </Menu.Item>
                        <Menu.Item name="gamepad">
                            <Icon name="gamepad" />
                            Meta Attributes
                        </Menu.Item>
                        <Menu.Item name="camera">
                            <Icon name="camera" />
                            Workflow
                        </Menu.Item>
                    </Menu>
                </Accordion.Content>
                <Accordion.Title>Metamodel Setup</Accordion.Title>
                <Accordion.Content>
                    <Menu vertical={true}>
                        <Menu.Item name="home">
                            <Icon name="home" />
                            Meta Objects
                        </Menu.Item>
                        <Menu.Item name="gamepad">
                            <Icon name="gamepad" />
                            Meta Attributes
                        </Menu.Item>
                        <Menu.Item name="camera">
                            <Icon name="camera" />
                            Workflow
                        </Menu.Item>
                    </Menu>
                </Accordion.Content>
            {/*<Menu.Item name="home">
              <Icon name="home" />
              Meta Objects
            </Menu.Item>
            <Menu.Item name="gamepad">
              <Icon name="gamepad" />
              Meta Attributes
            </Menu.Item>
            <Menu.Item name="camera">
              <Icon name="camera" />
              Workflow
            </Menu.Item>*/}
          </Accordion>
    );
  }
}