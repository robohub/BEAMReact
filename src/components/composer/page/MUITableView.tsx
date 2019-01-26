import * as React from 'react';
import { Query, ChildProps, /*QueryProps*/ } from 'react-apollo';
import BOEditContainer from './MUIEditContainer';
import { BizObjectsType, BOEditType } from './Types';
import SelectBOType from './bizobject/selectBOType';
import { allBOQuery } from './bizobject/queries';
import EditIcon from '@material-ui/icons/Edit';
import AttachementIcon from '@material-ui/icons/AttachFile';
import LinkIcon from '@material-ui/icons/Link';

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
  } from '@material-ui/core';

type Response = BizObjectsType;

interface InputProps {
    link: string;
}

interface State {
    showEditForm: boolean;
    selectedBO: BOEditType;
    allBusinessObjects: BizObjectsType;
}

export default class BOTableView extends React.Component<ChildProps<InputProps, Response>, State> {
    render() {
        return (
            <Query
                query={allBOQuery}
                fetchPolicy={'cache-and-network'}
            >
                {({ loading, data: { allBusinessObjects }, error }) => {
                    if (loading) {
                        return <div>Loading</div>;
                    }
                    if (error) {
                        return <h1>ERROR</h1>;
                    }

                    return (
                        <div>
                            <SelectBOType />
                            <Paper>
                                <Table padding="dense">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell variant="head" >Object Name</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>State</TableCell>
                                            <TableCell>Properties</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {allBusinessObjects.map((o: BOEditType, index: number) =>
                                            <TableRow key={o.id}>
                                                <TableCell>
                                                    <List>
                                                        <ListItemText>
                                                            <Typography variant="title">{o.name}</Typography>
                                                        </ListItemText>
                                                        <ListItem>
                                                            <ExpansionPanel>
                                                                <ExpansionPanelSummary expandIcon={<EditIcon />}>
                                                                    <Typography variant="subheading" >Edit</Typography>
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
                                                                        <span>- No relations -</span>
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
