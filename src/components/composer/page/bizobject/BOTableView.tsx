import * as React from 'react';
import { Query, ChildProps } from 'react-apollo';
import BOEditContainer from './BOEditContainer';
import { MOResponse } from './Types';
import { BizObjectsType, BOEditType } from '../../../../domain/utils/boUtils';

import SelectBOType from './selectBOType';
import { allBOQuery, deleteBizObject, MOQuery } from './queries';
import EditIcon from '@material-ui/icons/Edit';
import AttachementIcon from '@material-ui/icons/AttachFile';
import LinkIcon from '@material-ui/icons/Link';
import DeleteIcon from '@material-ui/icons/DeleteForeverOutlined';
import CloseIcon from '@material-ui/icons/Close';

import { client } from '../../../../index';
// import gql from 'graphql-tag';

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
    List,
    ListItem,
    ListItemText,
    Typography,
    Chip,
    Avatar,
    Button,
    Snackbar,
    IconButton,
} from '@material-ui/core';

/* Redundant? See deleteBO function
export const allBizRels = gql`
query allBizRelations {
  bizRelations {
    id
  }
}
`;
*/

type Response = BizObjectsType;

interface InputProps {
    link: string;
}

export default class BOTableView extends React.Component<ChildProps<InputProps, Response>> {
    state = {
        selectedBO: null as BOEditType,
        snackbarOpen: false,
    };

    deleteBO = (bo: BOEditType) => {

        this.setState({selectedBO: null}); // Close any other editing form

        const inputMo = bo.metaObject.id;   // Secure MO for the BO is in cache...
        client.query({
            query: MOQuery, variables: {id: inputMo} 
        }).then(() => {
//            client.query({  // Get all biz relations to cache, to use same query when updating cache to remove referenced deleted BO
//                query: allBizRels
//            }).then(() => {
                client.mutate({
                    mutation: deleteBizObject,
                    variables: {
                        id: bo.id
                    },
                    update: cache => {
                        // Remove BO from cache
                        const data: BizObjectsType = cache.readQuery({query: allBOQuery});
                        data.businessObjects.forEach((el, index) => {
                            if (el.id === bo.id) {
                                data.businessObjects.splice(index, 1);
                                return;
                            }
                        });
                        // Remove BO from relations in cache
                        var deletedBRs = new Array<string>();
                        data.businessObjects.forEach(el => {
                            for (var i = el.outgoingRelations.length - 1; i >= 0; i--) {
                                if (el.outgoingRelations[i].oppositeObject.id === bo.id) {
                                    deletedBRs.push(el.outgoingRelations[i].id);
                                    deletedBRs.push(el.outgoingRelations[i].oppositeRelation.id);
                                    el.outgoingRelations.splice(i, 1);  // Remove BR from relation, but the OBJECT BR will still be dangling in cache! see below
                                }
                            }
                        });
                        cache.writeQuery({query: allBOQuery, data});

/*                        // Remove BizRelation that connects other BOs to deleted BO from cache
                        const cacheRels: {bizRelations: {id: string}[]} = cache.readQuery({query: allBizRels});
                        deletedBRs.forEach(deletedBRid => {
                            for (var i = cacheRels.bizRelations.length - 1; i >= 0; i--) {
                                if (deletedBRid === cacheRels.bizRelations[i].id) {
                                    cacheRels.bizRelations.splice(i, 1);
                                }
                            }
                        });
                        // TODO RH: BizRelations försvinner från ROOT_QUERY men ligger kvara i Apollo Inspector, gäller även borttagen BO!!!!???
                        // I cache.data.data (i debugger) verkar det dock stämma?
                        // Ovanstående BizRelation-removal kan var onödig i dagsläget...
                        cache.writeQuery({query: allBizRels, data: cacheRels});
*/
                        // Remove BO from MO businessobjects (so related BOs won't see removed BO as selectable)
                        let found = false;
                        try {
                            const data2: MOResponse = cache.readQuery({query: MOQuery, variables: {id: inputMo} });
                            data2.metaObject.businessObjects.forEach((el, index) => {
                                if (el.id ===  bo.id) {
                                    if (data2.metaObject.businessObjects) {   // Check if BO in cache
                                        data2.metaObject.businessObjects.splice(index, 1);
                                    }
                                    found = true;
                                    return;
                                }
                            });
                            if (found) {
                                cache.writeQuery({ query: MOQuery, variables: {id: inputMo} , data: data2});
                            }
                        } catch {
                            alert('Error when trying to update cache for deleted object!');
                        }
                        
                        // tslint:disable-next-line:no-console
                        console.log('Deleted BO finished.....');

                        // Cache updates doesn't trigger re-render of this component!?!? Use state change solution for re-render...
                        // Is it due to cache update is in same component?
                        // Does cache changes in BOEditView update components because of showing the Snackbar!? IMPLEMENTED Snackbar -> updates...
                        // RH TODO
                        this.setState({snackbarOpen: true});
                    },
                    // refetchQueries: [ { query: allBOQuery } ]
                });
//            });
        });
    }

    uiSelectBO = (event: object, expanded: boolean, bo: BOEditType) => {
        if (expanded) {
            this.setState({selectedBO: bo});
        } else {
            this.setState({selectedBO: null});
        }
    }

    setSelectedBO = (bo: BOEditType) => {
        this.setState({selectedBO: bo});
    }

    snackbarClose = () => {
        this.setState({snackbarOpen: false});
    }

    componentDidMount() {
        // tslint:disable-next-line:no-console
        console.log('---> BOEditView skapades');
    }

    componentWillUpdate() {
        // tslint:disable-next-line:no-console
        console.log('---> BOEditView kommer uppdateras');
    }

    componentDidUpdate() {
        // tslint:disable-next-line:no-console
        console.log('---> BOEditView UPPDATERADES <-----');
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
                    console.log('--- BOTableView renderar --- Selected BO:' + (this.state.selectedBO ? this.state.selectedBO.id : null) );

                    const data: BizObjectsType = client.readQuery({query: allBOQuery });
                    // tslint:disable-next-line:no-console
                    console.log(data);
/*
                    // tslint:disable-next-line:no-console
                    console.log('From allBOQuery:' + JSON.stringify(businessObjects, null, 2));
*/
                    return (
                        <div>
                            <SelectBOType setSelectedBO={this.setSelectedBO}/>
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
                                                        onClick={() => this.deleteBO(o)}
                                                        color={'secondary'}
                                                    >
                                                        <DeleteIcon/>
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <List>
                                                        <ListItemText>
                                                            <Typography variant="h6">{o.name + ': ' + o.id}</Typography>
                                                        </ListItemText>
                                                        <ListItem>
                                                            <ExpansionPanel onChange={(event, expanded) => this.uiSelectBO(event, expanded, o)} expanded={this.state.selectedBO === o}>
                                                                <ExpansionPanelSummary expandIcon={<EditIcon color={'primary'}/>}>
                                                                    <Typography variant="button" >Edit</Typography>
                                                                </ExpansionPanelSummary>
                                                                <Divider/>

                                                                <ExpansionPanelDetails>
                                                                    <BOEditContainer 
                                                                        newObject={false} 
                                                                        metaID={o.metaObject.id}
                                                                        bizObject={o}
                                                                        selectedBO={this.state.selectedBO ? this.state.selectedBO.id : null}
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
                                                                                    // tslint:disable-next-line:max-line-length
                                                                                    label={r.metaRelation.oppositeName + ' = ' + r.oppositeObject.name + ': ' + r.id + '--' + (r.oppositeRelation === null ? 'null' : r.oppositeRelation.id)}
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
                            <Snackbar
                                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                                open={this.state.snackbarOpen}
                                autoHideDuration={3000}
                                onClose={this.snackbarClose}
                                ContentProps={{'aria-describedby': 'message-id'}}
                                message={<span id="message-id">Business Object deleted!</span>}
                                action={[
                                    <IconButton key="close" aria-label="Close" color="inherit" /* className={classes.close} */ onClick={this.snackbarClose}>
                                        <CloseIcon/>
                                    </IconButton>,
                                ]}
                            />   
                        </div>
                    );
                }}
            </Query>
        );
    }
}
