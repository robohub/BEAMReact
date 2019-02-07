import * as React from 'react';
import { /* MOEditType, */ MOPropertiesType, MOAttributeItemType } from './Types';

import MOListAttributes from './MOListAttributes';
import MOListRelations from './MOListRelations';
import { FontIcon, Divider, Button, TextField, /*FontIcon,*/ Grid, Cell, Snackbar } from 'react-md';

import EditAttributesModal from './modals/attributeModal';
import { MOEditFormData } from './forms/Types';

import { graphql, ChildProps, compose, MutationFunc } from 'react-apollo';
import { allMetaObjectsQuery, createMetaObj, updateMOAttributes, createMetaRelation } from './queries';

interface Props {
    allMetaObjects: MOPropertiesType[];
    allMetaAttributes: MOAttributeItemType[];
    // allMetaRelations: MORelationItemType[];
}

interface State {
    showEditForm: boolean;
    selectedMO: MOPropertiesType;
    toasts: { text: React.ReactNode }[];
}
class MOEdit extends React.Component<ChildProps<Props & MyMutations, {}>, State> {
    
    private moName = '';
    
    constructor(props: ChildProps<Props & MyMutations, {}>) {
        super(props);
        this.state = { showEditForm: false, selectedMO: null, toasts: []};
    }    
    
    handleInput = (value: string) => {
        this.moName = value;
    }
    createMO = async () => {
        await this.props.createMO({
            variables: {
                name: this.moName, 
                attrs: [],
                rels: []
            }/*,
            update: (store, { data: createMetaObject }) => {
                const data: MOEditType = store.readQuery({query: allMetaObjectsQuery });
                data.allMetaObjects.splice(0, 0, createMetaObject);
                store.writeQuery({ query: allMetaObjectsQuery, data });
            },*/
        });
    }

    updateMOAttrs = async (moId: string, attrs: string[]) => {

        // RH TODO
        // 1. Check if any existing attributes are removed
        // 1.5 If so -> check if any businessobjects has any data on that attribute for notification to user

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
    }

    findMRinMetaRelations(mrid: string): boolean {
        var found = false;
        this.state.selectedMO.outgoingRelations.forEach(mr => {
            if (mrid === mr.id) {
                found = true;
            }
        });
        return found;
    }

    addMORels = async (moId: string, newValues: MOEditFormData) => {

        // 1. Find and create new relations

        newValues.relations.map(async rel => {
            if (rel.id === undefined) {
                try {
                    await this.props.createMR({
                        variables: {
                            incomingid: moId, 
                            oppositeId: rel.oppositeObject.id,
                            oppName: rel.oppositeName,
                            multiplicity: rel.multiplicity,
                            oneway: rel.oneway
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
                    alert('Error in adding MORels: ' + e);
                }
        
            }
        });

        // 2. Find DeletedRels
        this.findMRinMetaRelations('TEST DUMMY');

        // 3. For each in NewRels
        // 3.1 Add newRel
        // 3.2 If newRel is twoway -> Add opposite newRel, connect the 2 new rels
        // 4. For each in DeleteRelse
        // 4.1 Delete delRel
        // 4.2 If delRel is twoway -> Delete opposite delRel
        // 5. Update MO with NewRelsIds -- BEHÖVS EJ om 3 är gjord?

    }
    
    formSaved = async (moId: string, values: MOEditFormData) => {
        this.hideEditForm();
        var attrs = new Array<string>(0);
        values.attributes.map(a =>
            attrs.push(a.id)
        );
        await this.updateMOAttrs(moId, attrs);
        await this.addMORels(moId, values);
        this.toastSaved();
    }
        
    switchEditOnOff = (event: React.MouseEvent<HTMLElement>) => {
        this.setState(
            {
                selectedMO: this.props.allMetaObjects[event.currentTarget.id], 
                showEditForm: !this.state.showEditForm
            });
    }    
    hideEditForm = () => {
        this.setState({ showEditForm: false });
    }

    dismissToast = () => {
        const [, ...toasts] = this.state.toasts;
        this.setState({ toasts });    }
    
    toastSaved = () => {
        this.addToast('Saved the Meta Object...');
    }

    addToast = (text: string) => {
        this.setState((state) => {
            const toasts = state.toasts.slice();
            toasts.push({ text });
            return { toasts };
        });
    }

    render() {
        return (
            <div>
                <Grid className="md-paper--1">
                    <Cell size={2}>
                        <TextField id="input" /*leftIcon={<FontIcon>plus</FontIcon>}*/ placeholder="Add Meta Object" onChange={this.handleInput}/> 
                    </Cell>
                    <Cell align="middle" size={10}>
                        <Button raised={true} primary={true} onClick={this.createMO}>Add</Button>
                    </Cell>
                </Grid>
                {this.props.allMetaObjects.map((obj, index) =>
                    <div key={obj.name}>
                        <Grid className="md-block-centered">
                            <Cell size={2}>
                                <div className="md-title">{obj.name}</div>
                                <Button 
                                    id={index}
                                    size="small"
                                    onClick={this.switchEditOnOff}
                                    primary={true}
                                    flat={true}
                                    iconEl={<FontIcon>create</FontIcon>}
                                >
                                    Edit
                                </Button>
                            </Cell>
                            <Cell size={10}>
                                <MOListAttributes name={obj.name} attributes={obj.attributes} />
                                <Divider style={{marginTop: 10, marginBottom: 10}}/>
                                <MOListRelations name={obj.name} outgoingRelations={obj.outgoingRelations}/>
                            </Cell>
                        </Grid>        
                        <Divider/>
                    </div>
                )}
                <EditAttributesModal
                    metaObject={this.state.selectedMO}
                    metaAttributes={this.props.allMetaAttributes}
                    metaObjects={this.props.allMetaObjects}
                    onFormSave={this.formSaved}
                    visible={this.state.showEditForm}
                    hide={this.hideEditForm}
                />
                <Snackbar
                    id="example-snackbar"
                    toasts={this.state.toasts}
                    autohide={true}
                    onDismiss={this.dismissToast}
                />
            </div>

        );
    }
}

interface MyMutations {
    createMR: MutationFunc<{ id: string; }>;
    updateMOAttrs: MutationFunc<{ id: string; }>;
    createMO: MutationFunc<{}>;
}

export default compose(
    graphql<{}, Props>(createMetaRelation, { name: 'createMR' }),
    graphql<{}, Props>(updateMOAttributes, { name: 'updateMOAttrs' }),
    graphql<{}, Props>(createMetaObj, { name: 'createMO' })  
)(MOEdit);
