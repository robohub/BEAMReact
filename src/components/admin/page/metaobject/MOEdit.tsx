import * as React from 'react';
import { MOEditType, MOPropertiesType, MOAttributeItemType } from './Types';

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
            },
            update: (store, { data: createMetaObject }) => {
                const data: MOEditType = store.readQuery({query: allMetaObjectsQuery });
                data.allMetaObjects.splice(0, 0, createMetaObject);
                store.writeQuery({ query: allMetaObjectsQuery, data });
            },
        });
    }

    updateMOAttrs = async (moId: string, attrs: string[]) => {
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

    addMORels = async (moId: string, newRelation: MOEditFormData) => {

        // 1. Find NewRels
        // 2. Find DeletedRels
        // 3. For each in NewRels
        // 3.1 Add newRel
        // 3.2 If newRel is twoway -> Add opposite newRel, connect the 2 new rels
        // 4. For each in DeleteRelse
        // 4.1 Delete delRel
        // 4.2 If delRel is twoway -> Delete opposite delRel
        // 5. Update MO with NewRelsIds -- BEHÖVS EJ om 3 är gjord?
        try {
            await this.props.createMR({
                variables: {
                    incomingid: moId, 
                    oppositeId: newRelation.relations[0].oppositeObject.id,
                    oppName: newRelation.relations[0].oppositeName,
                    multiplicity: newRelation.relations[0].multiplicity,
                    oneway: newRelation.relations[0].oneway
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
    
    formSaved = async (moId: string, values: MOEditFormData) => {   // ASYNC!
        this.hideEditForm();
        var attrs = new Array<string>(0);
        values.attributes.map(a =>
            attrs.push(a.id)
        );
        await this.updateMOAttrs(moId, attrs);
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
                        <TextField id="input" /*leftIcon={<FontIcon>plus</FontIcon>}*/ placeholder="Add Meta Object" /*onChange={this.handleInput}*//> 
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
