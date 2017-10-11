import * as React from 'react';
import { Table } from 'semantic-ui-react';
import { MORelationItemType } from './../Types';

interface Props {
    outgoingRelations: MORelationItemType[];
}

export class EditMORelationsPane extends React.Component<Props> {
    render () {
        return (
            <Table celled={true}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Opposite Object</Table.HeaderCell>
                        <Table.HeaderCell>Multiplicity</Table.HeaderCell>
                        <Table.HeaderCell>Oneway</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {this.props.outgoingRelations.map(r =>
                        <Table.Row key={r.oppositeName}>
                            <Table.Cell>{r.oppositeName}</Table.Cell>
                            <Table.Cell>{r.oppositeObject.name}</Table.Cell>
                            <Table.Cell>{r.multiplicity}</Table.Cell>
                            <Table.Cell>{r.oneway ? 'Yes' : 'No'}</Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        );
    }
}