import * as React from 'react';
import { /* MOEditType, */ MOPropertiesType, MOAttributeItemType } from './Types';

import { client as apolloClient } from '../../../../index';

import MOListAttributes from './MOListAttributes';
import MOListRelations from './MOListRelations';
import { Divider, Button, TextField, Grid, Snackbar, IconButton, Paper, Typography } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';

import EditPropertiesModal from './modals/propertiesModal';
import { MOEditFormData } from './forms/Types';

import { graphql, ChildProps, compose, MutationFunc, FetchResult } from 'react-apollo';
import { allMetaObjectsQuery, createMetaObj, updateMOAttributes, createMRWithoutOppRelation, createMetaRelation, deleteMetaRel, findBizObjsWithMetaAttribute, updateMRWithOppRel } from './queries';

type FormValues = MOEditFormData;   // RH TODO temporär

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from './../../../shared/style';

interface Props extends WithStyles<typeof styles> {
    metaObjects: MOPropertiesType[];
    metaAttributes: MOAttributeItemType[];
    // allMetaRelations: MORelationItemType[];
}

interface State {
    showEditForm: boolean;
    selectedMO: MOPropertiesType;
    snackbarOpen: boolean;
}

class MOEdit extends React.Component<ChildProps<Props & MyMutations, {}>, State> {
    private moName: string = '';

    constructor(props: ChildProps<Props & MyMutations, {}>) {
        super(props);
        this.state = { showEditForm: false, selectedMO: null, snackbarOpen: false };
    }

    handleInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        this.moName = event.target.value;
    }
    
    createMO = async () => {
        try {
            // RH TODO Check that name is unique before or after...???
            await this.props.createMO({
                variables: {
                    name: this.moName, 
                    attrs: null,
                    rels: null
                }, /*
                update: (store, { data: createMetaObject }) => {
                    const data: MOEditType = store.readQuery({query: allMetaObjectsQuery });
                    data.allMetaObjects.splice(0, 0, createMetaObject);
                    store.writeQuery({ query: allMetaObjectsQuery, data });
                },*/
                refetchQueries: [{     // TODO: optimize!!! T.ex. getMO(moId)
                    query: allMetaObjectsQuery,
                    // variables: { repoFullName: 'apollographql/apollo-client' },
                }],
            });
        } catch (e) {
            alert('Error when creating meta object: ' + e);
        }
    }

    updateMOAttrs = async (moId: string, attrs: {id: string}[]) => {

        // RH TODO
        // 1. Check if any existing attributes are removed
        // 1.5 If so -> check if any businessobjects has any data on that attribute for notification to user
        this.state.selectedMO.attributes.forEach(async ma => {
            var found = false;
            for (var i = 0; i < attrs.length; i++ ) {
                if (ma.id === attrs[i].id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                //
                try {
                    const { data } = await apolloClient.query({
                        query: findBizObjsWithMetaAttribute,
                        fetchPolicy: 'network-only',
                        variables: { maid: ma.id }
                    });
                    if (data.businessObjects.length > 0) {
                        // RH TODO: bättre logik om BO har värde i attrbutet som kriterie för varningen?
                        alert('Some business objects are using the meta attribute: ' + ma.name + '\n\nRemove attribute anyway?');
                    }
                } catch (e) {
                    alert('Error when searching for metarelation: ' + e);
                }
            }

        });
        try {
            await this.props.updateMOAttrs({
                variables: {
                    id: moId, 
                    attrs: attrs
                },
                refetchQueries: [{     // TODO: optimize!!! T.ex. getMO(moId)
                    query: allMetaObjectsQuery,
                    // variables: { repoFullName: 'apollographql/apollo-client' },
                }],            /*
                update: (store, { data: { createMetaObject }}) => {
                    const data: MOEditType = store.readQuery({query: allMetaObjectsQuery });
                    data.allMetaObjects.splice(0, 0, createMetaObject);
                    store.writeQuery({ query: allMetaObjectsQuery, data });
                },
                */
            });
        } catch (e) {
            alert('Error when updating meta attributes: ' + e);
        }
    }
/* RH TODO Not used?
    findMRinMetaRelations(mrid: string): boolean {
        var found = false;
        this.state.selectedMO.outgoingRelations.forEach(mr => {
            if (mrid === mr.id) {
                found = true;
            }
        });
        return found;
    }
*/
    addMORels = async (moId: string, newValues: FormValues) => {

        // Find any added relations
        newValues.relations.map(async rel => {
            if (rel.id === undefined) {
                // Create new doublelinked relation
                try {
                    await this.props.createMRWOOpprel({
                        variables: {
                            incomingid: moId,
                            oppositeId: rel.oppositeObject.id,
                            oppName: rel.oppositeName,
                            multiplicity: rel.multiplicity,
                        },
                    }).then(async (response: FetchResult<{createMetaRelation: { id: string; }}>) => {
                        // Create opposite relation and connect to previously created MetaRelation and vice versa
                        var firstMRId = response.data.createMetaRelation.id;
                        await this.props.createMR({
                            variables: {
                                incomingid: rel.oppositeObject.id,
                                oppositeId: moId,
                                oppName: rel.oppositeRelation.oppositeName,
                                multiplicity: rel.oppositeRelation.multiplicity,
                                opprelid: firstMRId
                            }                          
                        }).then(async (response2: FetchResult<{createMetaRelation: { id: string; }}>) => {
                            await this.props.updateMR({
                                variables: {
                                    id: firstMRId,
                                    oppositeId: response2.data.createMetaRelation.id,
                                },
                                refetchQueries: [{     // TODO: optimize!!! T.ex. getMO(moId)
                                    query: allMetaObjectsQuery,
                                    // variables: { repoFullName: 'apollographql/apollo-client' },
                                }],            
                                // update: (store, { data: { createMetaObject }}) => {
                                //    const data: MOEditType = store.readQuery({query: allMetaObjectsQuery });
                                //    data.allMetaObjects.splice(0, 0, createMetaObject);
                                //    store.writeQuery({ query: allMetaObjectsQuery, data });
                                // },   
                            });
                        });
                    });
                } catch (e) {
                    alert('Error in adding MORels: ' + e);
                }
            }
        });
        // Find any removed relations
        this.state.selectedMO.outgoingRelations.forEach(async mr => {
            var found = false;
            for (var i = 0; i < newValues.relations.length; i++ ) {
                if (mr.id === newValues.relations[i].id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                // Delete removed doublelinked relation
                try {
                    await this.props.deleteMR({
                        variables: {
                            mrid: mr.id,
                        },
                    });
                    await this.props.deleteMR({
                        variables: {
                            mrid: mr.oppositeRelation.id,
                        },
                        refetchQueries: [{     // TODO: optimize!!! T.ex. getMO(moId)
                            query: allMetaObjectsQuery,
                            // variables: { repoFullName: 'apollographql/apollo-client' },
                        }], 
                    });
                } catch (e) {
                    alert('Error in deleting MORels: ' + e);
                }
            }
        });
    }
    
    formSaved = async (values: FormValues) => {
        this.hideEditForm();
        var attrs = new Array<{id: string}>(0);
        values.attributes.map(a =>
            attrs.push({id: a.id})
        );
        await this.updateMOAttrs(this.state.selectedMO.id, attrs);
        await this.addMORels(this.state.selectedMO.id, values);
        this.setState({snackbarOpen: true});
    }
        
    switchEditOnOff = (event: React.MouseEvent<HTMLElement>) => {
        this.setState(
            {
                selectedMO: this.props.metaObjects[event.currentTarget.id], 
                showEditForm: !this.state.showEditForm
            });
    }    
    hideEditForm = () => {
        this.setState({ showEditForm: false });
    }

    snackbarClose = () => {
        this.setState({snackbarOpen: false});
    }

    render() {
        return (
            <div className={this.props.classes.root}>
                <TextField id="input" placeholder="Add Meta Object" onChange={this.handleInput} className={this.props.classes.textField}/>
                <Button variant={'contained'} color={'primary'} onClick={this.createMO}>Add</Button>
                <Paper>
                    {this.props.metaObjects.map((obj, index) =>
                        <div key={obj.name} className={this.props.classes.root}>
                            <Grid container={true} style={{paddingTop: 10}}>
                                <Grid item={true} xs={2}>
                                    <Typography variant="h6">{obj.name}</Typography>
                                    <Button 
                                        id={index.toString()}
                                        size="small"
                                        onClick={this.switchEditOnOff}
                                        variant={'text'}
                                        color={'primary'}
                                    >
                                        <EditIcon/>
                                        Edit
                                    </Button>
                                </Grid>
                                <Grid item={true} xs={10}>
                                    <MOListAttributes name={obj.name} attributes={obj.attributes} />
                                    <Divider style={{marginTop: 10, marginBottom: 10}}/>
                                    <MOListRelations name={obj.name} outgoingRelations={obj.outgoingRelations}/>
                                </Grid>
                            </Grid>        
                            <Divider style={{marginTop: 10}}/>
                        </div>
                    )}
                </Paper>
                <EditPropertiesModal
                    metaObject={this.state.selectedMO}
                    metaAttributes={this.props.metaAttributes}
                    metaObjects={this.props.metaObjects}
                    onFormSave={this.formSaved}
                    visible={this.state.showEditForm}
                    hide={this.hideEditForm}
                />
                <Snackbar
                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                    open={this.state.snackbarOpen}
                    autoHideDuration={6000}
                    onClose={this.snackbarClose}
                    ContentProps={{'aria-describedby': 'message-id'}}
                    message={<span id="message-id">Saved Meta Object</span>}
                    action={[
                        <IconButton key="close" aria-label="Close" color="inherit" /* className={classes.close} */ onClick={this.snackbarClose}>
                            <CloseIcon/>
                        </IconButton>,
                    ]}
                />    
            </div>

        );
    }
}

interface MyMutations {
    updateMR: MutationFunc<{ id: string; }>;
    createMRWOOpprel: MutationFunc<{ id: string; }>;
    createMR: MutationFunc<{ id: string; }>;
    updateMOAttrs: MutationFunc<{ id: string; }>;
    createMO: MutationFunc<{}>;
    deleteMR: MutationFunc<{ id: string; }>;
}
export default withStyles(styles)(compose(
    graphql<{}, Props>(updateMRWithOppRel, { name: 'updateMR' }),
    graphql<{}, Props>(createMRWithoutOppRelation, { name: 'createMRWOOpprel' }),
    graphql<{}, Props>(createMetaRelation, { name: 'createMR' }),
    graphql<{}, Props>(deleteMetaRel, { name: 'deleteMR' }),
    graphql<{}, Props>(updateMOAttributes, { name: 'updateMOAttrs' }),
    graphql<{}, Props>(createMetaObj, { name: 'createMO' })  
)(MOEdit));
