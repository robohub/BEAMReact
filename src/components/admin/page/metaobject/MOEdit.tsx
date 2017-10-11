import * as React from 'react';
import { MOEditType, MOPropertiesType, MOAttributeItemType } from './Types';

import MOListAttributes from './MOListAttributes';
import MOListRelations from './MOListRelations';
import { Segment, Menu, Input, Button, Label, InputOnChangeData } from 'semantic-ui-react';

import EditAttributesModal from './modals/attributeModal';
import { MOEditRelsFormData } from './forms/EditMORelationsForm';

import { graphql, ChildProps, compose, MutationFunc } from 'react-apollo';
import { allMetaObjectsQuery, createMetaObj, updateMOAttributes, createMetaRelation } from './queries';

interface Props {
    allMetaObjects: MOPropertiesType[];
    allMetaAttributes: MOAttributeItemType[];
    // allMetaRelations: MORelationItemType[];
}
class MOEdit extends React.Component<ChildProps<Props & MyMutations, {}>> {
        
    private moName = '';
    
    handleInput = (event: React.KeyboardEvent<HTMLInputElement>, data: InputOnChangeData) => {
        this.moName = data.value;
    }
    onCreateMO = async () => {
        await this.props.createMO({
            variables: {
                name: this.moName, 
                attrs: [],
                rels: []
            },
            update: (store, { data: { createMetaObject }}) => {
                const data: MOEditType = store.readQuery({query: allMetaObjectsQuery });
                data.allMetaObjects.splice(0, 0, createMetaObject);
                store.writeQuery({ query: allMetaObjectsQuery, data });
            },
        });
    }

    onUpdateMOAttrs = async (moId: string, attrs: string[]) => {
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

    onAddMORels = async (moId: string, newRelation: MOEditRelsFormData) => {

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
                    oppositeId: newRelation.id,
                    oppName: newRelation.name,
                    multiplicity: newRelation.multiplicity,
                    oneway: newRelation.oneway
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

    render() {
        return (
            <Segment.Group>
                <Segment>
                    <Input icon="plus" iconPosition="left" placeholder="Add metaobject" onChange={this.handleInput}/>
                    {' '}
                    <Button disabled={false} onClick={this.onCreateMO}>Add</Button>
                </Segment>
                <Segment>
                    {this.props.allMetaObjects.map(obj =>
                        <Segment key={obj.name} >
                            <Segment >
                                <Menu secondary={true} size="small">
                                    <Menu.Header><Label ribbon={true} size="big" color="yellow">{obj.name}</Label></Menu.Header>
                                    <Menu.Item position="right">
                                        <Input icon="search" placeholder="Search..." />
                                    </Menu.Item>
                                    <EditAttributesModal
                                        metaObject={obj}
                                        metaAttributes={this.props.allMetaAttributes}
                                        metaObjects={this.props.allMetaObjects}
                                        onSaveAttrs={this.onUpdateMOAttrs}
                                        onAddRels={this.onAddMORels}
                                    />
                                    <Button circular={true} icon="setting"/>
                                </Menu>        
                            </Segment>
                            { obj.attributes.length === 0 ?
                                <Segment>No attributes</Segment>
                                :
                                <MOListAttributes name={obj.name} attributes={obj.attributes} />
                            }
                            { obj.outgoingRelations.length === 0 ?
                                <Segment>No relations</Segment>
                                :
                                <MOListRelations name={obj.name} outgoingRelations={obj.outgoingRelations}/>
                            }
                        </Segment>
                    )}
                </Segment>
            </Segment.Group>
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
