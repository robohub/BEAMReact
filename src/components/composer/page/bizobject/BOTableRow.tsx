import * as React from 'react';
import BOEditContainer from './BOEditContainer';
import { BOEditType } from './../Types';
import { graphql, ChildProps, compose, MutationFunc } from 'react-apollo';
import { deleteBizObject, deleteBizRelation, deleteBizAttr, allBOQuery } from './queries';

import { Table, Label, Icon, Button, Segment, Header } from 'semantic-ui-react';

type Props = {
    bizObject: BOEditType;
};

class BOTableRow extends React.Component<ChildProps<Props & MyMutations, {}>> {
    state = { showEditForm: false };

    switchEditOnOff = () => {
        this.setState({ showEditForm: !this.state.showEditForm});
    }

    deleteBizObject = async () => {
        let { bizObject } = this.props;
        try {
            for (let i = 0; i < bizObject.outgoingRelations.length; i++) {
                await this.props.deleteBizRel({
                    variables: {
                        bizRelId: bizObject.outgoingRelations[i].id, 
                    },
                });
            }
            for (let i = 0; i < bizObject.bizAttributes.length; i++) {
                await this.props.deleteBizAttr({
                    variables: {
                        bizAttrId: bizObject.bizAttributes[i].id, 
                    },
                });
            }
            await this.props.deleteBizObj({
                variables: {
                    id: bizObject.id,   
                },
                refetchQueries: [{   // TODO: Endast för protoyping... This will update the UI
                    query: allBOQuery,
                    variables: { repoFullName: 'apollographql/apollo-client' },
                  }],
            });
        } catch (err) {
            alert('Error when deleting business object/relations...\n' + err);
        }
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
                        <Icon name="edit"/>Edit
                    </Button>
                    <Button size="small" color="red" onClick={this.deleteBizObject} >
                        <Icon name="erase"/>Delete
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

interface MyMutations {
    deleteBizAttr: MutationFunc<{ id: string; }>;
    deleteBizRel: MutationFunc<{ id: string; }>;
    deleteBizObj: MutationFunc<{ id: string; }>;
}

export default compose(
    graphql<{}, Props>(deleteBizAttr, { name: 'deleteBizAttr' }),
    graphql<{}, Props>(deleteBizRelation, { name: 'deleteBizRel' }),
    graphql<{}, Props>(deleteBizObject, { name: 'deleteBizObj'}),    
)(BOTableRow);