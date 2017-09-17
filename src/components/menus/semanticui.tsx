import * as React from 'react';
import { Menu, MenuItemProps } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

interface State {
    activeItem: string;
}
export default class MenuExampleHeader extends React.Component<{}, State> {
    name: string = '';

    constructor() {
        super();
        this.state = {
            activeItem: '',
        };
    }

  handleItemClick = (event: React.MouseEvent<HTMLAnchorElement>, item: MenuItemProps) => this.setState({ activeItem: item.name });

  render() {

    return (
      <Menu>
        <Menu.Item header={true}>BEAM</Menu.Item>
        <Menu.Item name="chart" active={this.state.activeItem === 'chart'} onClick={this.handleItemClick} as={Link} to="/Chart" />
        <Menu.Item name="diagram" active={this.state.activeItem === 'diagrams'} onClick={this.handleItemClick} as={Link} to="/Diagram" />
        <Menu.Item name="admin" active={this.state.activeItem === 'admin'} onClick={this.handleItemClick} as={Link} to="/Admin" />
        <Menu.Item name="composer" active={this.state.activeItem === 'composer'} onClick={this.handleItemClick} as={Link} to="/Composer" />
        
    </Menu>
    );
  }
}