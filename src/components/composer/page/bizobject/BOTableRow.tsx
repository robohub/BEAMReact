import * as React from 'react';
import BOEditContainer from './BOEditContainer';
import { BOEditType } from './../Types';

// import { Link } from 'react-router-dom';
import { Table, Label, Icon, Button, Segment, Header } from 'semantic-ui-react';

type Props = {
    /* oid: string;
    name: string;
    state: string;
    metaObject: {name: string};
    bizAttributes: BizAttributeType[];
    outgoingRelations: BizRelationsType[]*/
    bizObject: BOEditType;
};

export default class BOTableRow extends React.Component<Props> {
    state = { showEditForm: false };

    switchEditOnOff = () => {
        this.setState({ showEditForm: !this.state.showEditForm});
    }
    
    render() {
        const { name, state, metaObject, bizAttributes, outgoingRelations} = this.props.bizObject;
        
        return (
            <Table.Row>
                <Table.Cell verticalAlign="top">
                    <Segment>
                        <Header>{name}</Header>
                    </Segment>
                    <Button size="small" onClick={this.switchEditOnOff} primary={true}>
                        <Icon name="pencil"/>Edit
                    </Button>
                </Table.Cell>   
                <Table.Cell verticalAlign="top">
                    {metaObject.name}
                </Table.Cell>     
                <Table.Cell verticalAlign="top">
                    <Button size="large">{state}</Button>
                </Table.Cell>     
                <Table.Cell verticalAlign="top">
                    {this.state.showEditForm ? 
                        <BOEditContainer 
                            newObject={false} 
                            metaID={this.props.bizObject.metaObject.id}
                            bizObject={this.props.bizObject}
                        />
                        :
                        <span>
                            <Segment>
                                {bizAttributes.length > 0 ?
                                    <span>                
                                        {bizAttributes.map(a =>
                                            <Label key={a.id}>
                                                <Icon name="attach"/>{a.metaAttribute.name} = {a.value}
                                            </Label>
                                        )}
                                    </span>
                                    :
                                    <span>- No attributes -</span>
                                }
                            </Segment>
                            <Segment>
                                {outgoingRelations.length > 0 ?
                                    <span>                
                                        {outgoingRelations.map(r =>
                                            <Label key={r.id}>
                                                <Icon name="linkify"/>{r.metaRelation.oppositeName} = {r.oppositeObject.name}
                                            </Label>
                                        )}
                                    </span>
                                    :
                                    <span>- No relations -</span>
                                }
                            </Segment>
                        </span>
                    }
                </Table.Cell>
            </Table.Row>
        );
    }
}
