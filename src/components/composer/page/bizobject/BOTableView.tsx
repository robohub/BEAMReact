import * as React from 'react';
import { Query, ChildProps, /*QueryProps*/ } from 'react-apollo';
import BOEditContainer from './BOEditContainer';
import { BizObjectsType, BOEditType } from './Types';
import SelectBOType from './selectBOType';
import { allBOQuery, deleteBizObject } from './queries';
import EditIcon from '@material-ui/icons/Edit';
import AttachementIcon from '@material-ui/icons/AttachFile';
import LinkIcon from '@material-ui/icons/Link';
import DeleteIcon from '@material-ui/icons/Delete';
import { client } from '../../../../index';

import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
    Divider,
//    ExpansionPanelActions,
//    Button,
    List,
    ListItem,
    ListItemText,
    Typography,
    Chip,
    Avatar,
    Button,
  } from '@material-ui/core';

type Response = BizObjectsType;

interface InputProps {
    link: string;
}

export default class BOTableView extends React.Component<ChildProps<InputProps, Response>> {
    
    deleteBO = (boid: string) => {
        client.mutate({
            mutation: deleteBizObject,
            variables: {
                id: boid
            },
            update: (cache) => {
                const data: BizObjectsType = cache.readQuery({query: allBOQuery });
                data.businessObjects.forEach((el, index) => {
                    if (el.id === boid) {
                        data.businessObjects.splice(index, 1);
                        return;
                    }
                });
                cache.writeQuery({ query: allBOQuery, data });
            },
            refetchQueries: [ { query: allBOQuery } ]
        });
    }
    
    render() {
        return (
            <Query
                query={allBOQuery}
                fetchPolicy={'cache-and-network'}
            >
                {({ loading, data: { businessObjects }, error }) => {
                    if (loading) {
                        return <div>Loading</div>;
                    }
                    if (error) {
                        return <h1>ERROR</h1>;
                    }

                    // tslint:disable-next-line:no-console
                    console.log('Nummer x...Updating TabeView');

                    return (
                        <div>
                            <SelectBOType />
                            <Paper>
                                <Table padding="dense">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><Typography variant="h6">{' '}</Typography></TableCell>
                                            <TableCell><Typography variant="h6">Object Name</Typography></TableCell>
                                            <TableCell><Typography variant="h6">Type</Typography></TableCell>
                                            <TableCell><Typography variant="h6">State</Typography></TableCell>
                                            <TableCell><Typography variant="h6">Properties</Typography></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {businessObjects.map((o: BOEditType, index: number) =>
                                            <TableRow key={o.id}>
                                                <TableCell>
                                                    <Button
                                                        onClick={() => this.deleteBO(o.id)}
                                                        color={'secondary'}
                                                    >
                                                        <DeleteIcon/>
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <List>
                                                        <ListItemText>
                                                            <Typography variant="h6">{o.name}</Typography>
                                                        </ListItemText>
                                                        <ListItem>
                                                            <ExpansionPanel>
                                                                <ExpansionPanelSummary expandIcon={<EditIcon />}>
                                                                    <Typography variant="button" >Edit</Typography>
                                                                </ExpansionPanelSummary>
                                                                <Divider/>

                                                                <ExpansionPanelDetails>
                                                                    <BOEditContainer 
                                                                        newObject={false} 
                                                                        metaID={o.metaObject.id}
                                                                        bizObject={o}
                                                                    />
                                                                </ExpansionPanelDetails>
                                                                <Divider />

                                                            </ExpansionPanel>
                                                        </ListItem>
                                                    </List>
                                                </TableCell>
                                                <TableCell>
                                                    {o.metaObject.name}
                                                </TableCell>
                                                <TableCell>
                                                    {o.state}
                                                </TableCell>
                                                    <TableCell>
                                                        <List>
                                                            <ListItem>
                                                                {o.bizAttributes.length > 0 ?
                                                                    <span>                
                                                                        {o.bizAttributes.map(a =>
                                                                            <Chip 
                                                                                key={a.id}
                                                                                label={a.metaAttribute.name + ' = ' + a.value}
                                                                                avatar={<Avatar><AttachementIcon/></Avatar>}
                                                                            />
                                                                        )}
                                                                    </span>
                                                                    :
                                                                    <span className="robchip">- No attributes -</span>
                                                                }
                                                            </ListItem>
                                                            <Divider/>
                                                            <ListItem>
                                                                {o.outgoingRelations.length > 0 ?
                                                                        <span>                
                                                                            {o.outgoingRelations.map(r =>
                                                                                <Chip 
                                                                                    key={r.id}
                                                                                    label={r.metaRelation.oppositeName + ' = ' + r.oppositeObject.name}
                                                                                    avatar={<Avatar><LinkIcon/></Avatar>}
                                                                                />
                                                                            )}
                                                                        </span>
                                                                        :
                                                                        <span className="robchip">- No relations -</span>
                                                                }
                                                            </ListItem>
                                                        </List>
                                                    </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </div>
                    );
                }}
            </Query>
        );
    }
}
