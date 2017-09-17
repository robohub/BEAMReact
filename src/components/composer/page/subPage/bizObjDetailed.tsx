import * as React from 'react';
import { Header, Segment } from 'semantic-ui-react';

interface Props {
  name: string;
}
export default class BizObjDetailed extends React.Component<Props> {

  render() {

    return (
        <Segment>
            <Header> {this.props.name} </Header>
        </Segment>
    );
  }
}