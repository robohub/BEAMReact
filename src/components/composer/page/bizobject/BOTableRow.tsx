import './../page.css';

import * as React from 'react';
import { BOEditType } from './../Types';
import { graphql, ChildProps, compose, MutationFunc } from 'react-apollo';
import { deleteBizObject, deleteBizRelation, deleteBizAttr, allBOQuery } from './queries';

import {
    Button, FontIcon, Paper, Chip, Avatar,
    TableRow,
    TableColumn,
} from 'react-md';

type Props = {
    bizObject: BOEditType;
    showEditForm: ( event: React.MouseEvent<HTMLElement>) => void;
    index: number;
};

class BOTableRow extends React.Component<ChildProps<Props & MyMutations, {}>> {

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
            <TableRow selectable={false} /*className="md-btn--text"*/>
                <TableColumn >
                    <Paper className="md-title" zDepth={0}>
                        {name}
                    </Paper>
                </TableColumn >
                <TableColumn >
                    <Button 
                        id={this.props.index}
                        size="small"
                        onClick={this.props.showEditForm}
                        primary={true}
                        flat={true}
                        iconEl={<FontIcon>create</FontIcon>}
                    >
                        Edit
                    </Button>
                    <Button size="small" onClick={this.deleteBizObject} secondary={true} flat={true} iconEl={<FontIcon>delete_forever</FontIcon>}>
                        Delete
                    </Button>
                </TableColumn>   
                <TableColumn >
                    {metaObject.name}
                </TableColumn>     
                <TableColumn >
                    <Button flat={true} size="large">{state}</Button>
                </TableColumn>     
                <TableColumn >
                    <Paper zDepth={0}>
                        {bizAttributes.length > 0 ?
                            <span>                
                                {bizAttributes.map(a =>
                                    <Chip 
                                        key={a.id}
                                        label={a.metaAttribute.name + ' = ' + a.value}
                                        avatar={<Avatar><FontIcon>attachment</FontIcon></Avatar>}
                                    />
                                )}
                            </span>
                            :
                            <span className="robchip">- No attributes -</span>
                        }
                    </Paper>
                    <Paper zDepth={0}>
                        {outgoingRelations.length > 0 ?
                            <span>                
                                {outgoingRelations.map(r =>
                                    <Chip 
                                        key={r.id}
                                        label={r.metaRelation.oppositeName + ' = ' + r.oppositeObject.name}
                                        avatar={<Avatar><FontIcon>link</FontIcon></Avatar>}
                                    />
                                )}
                            </span>
                            :
                            <span>- No relations -</span>
                        }
                    </Paper>
                </TableColumn>
            </TableRow>
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