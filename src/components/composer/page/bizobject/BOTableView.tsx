import * as React from 'react';
import { graphql, ChildProps, /*QueryProps*/ } from 'react-apollo';
import BOTableRow from './BOTableRow';
import { BizObjectsType } from './../Types';
import { Table } from 'semantic-ui-react';
import SelectBOType from './selectBOType';
import { allBOQuery } from './queries';

type Response = BizObjectsType;

interface InputProps {
  link: string;
}
  
class BOTableView extends React.Component<ChildProps<InputProps, Response>> {

    render() {
      const { loading, allBusinessObjects, error } = this.props.data;

      // const { link } = this.props;

      if (loading) {
        return <div>Loading</div>;
      }
      if (error) {
          return <h1>ERROR</h1>;
      } 
      return (
        <div>
          <SelectBOType/>
          <Table celled={true} sortable={true}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Object</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>State</Table.HeaderCell>
                <Table.HeaderCell>Properties</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
              {allBusinessObjects.map(o =>
                  <BOTableRow 
                    key={o.id}
                    bizObject={o}
                  />
              )}
            </Table.Body>
          </Table>
        </div>);
    }
}
export default graphql<Response, InputProps>(allBOQuery)(BOTableView);
