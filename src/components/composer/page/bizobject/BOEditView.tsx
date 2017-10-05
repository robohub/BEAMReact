import * as React from 'react';
import { graphql, gql, ChildProps, compose, MutationFunc } from 'react-apollo';
import { allBOQuery, deleteBizRelation, createBizRelation, updateBizAttribute, updateBizObject } from './queries';
import BOEditForm, { BOEditFormData } from './BOEditForm';
import { MOResponse, BizObjectsType, BOEditType, BizRelationsType } from './../Types';
// import { client as apolloClient } from '../../../../index';
// import * as diff from 'deep-diff';

const createBizObject = gql`
mutation CreateBO (
    $id: ID!, 
    $name: String!, 
    $state: String!,
    $attrs: [BizAttributeInput!],
    $rels: [BizRelationInput!]    
) 
{
    createBusinessObject(input: {
        metaObject: { id: $id },
        name: $name,
        state: $state,
        bizAttributes: $attrs,
        outgoingRelations: $rels
    })
    {
        businessObject {
            id
            name
            state
            metaObject {
                id
                name
            }
            bizAttributes {
                id
                metaAttribute
                {
                    id
                    name
                }
                value
            }
            outgoingRelations {
                id
                oppositeObject {
                    id
                    name
                }
                metaRelation {
                    id
                    oppositeRelation {
                        id
                    }
                }
            }
        }
    }
}
`;

interface TEST {
    createBusinessObject: BOEditType;
}

type AttrType = { [x: string]: { Value: string }};
type RelType = { [x: string]: { Value: string | string[] }};

type BizRelPair = { metaRelation: {id: string}, oppositeObject: {id: string} };
type UpdateBizRelPair = { bizRelId: string, value: string };

type BizRelMetaMapType = { bizkey: string, metaRelationId: string, oppositeObjectId: string};

class EditBOView extends React.Component<ChildProps<MyProps & MyMutations, TEST>> {

    private formInit: BOEditFormData;
    private bizrelIdMappings: Array<BizRelMetaMapType>;  // Use this to find bizRelation-id for deleted <metaRelationId,Value>
    
    fromBOToForm = (newObject: boolean) => {
        
        const { attributes: metaAttrs, outgoingRelations: metaRels } = this.props.metaobject.metaObject;
        var formAttrs: AttrType = {};
        var formRels: RelType = {}; 
        
        if (newObject) {
            metaAttrs.map(ma => {
                formAttrs[ma.id] = { Value: ''};
            });
            metaRels.map(mr => {
                let value: string | string[] = '';
                if (mr.multiplicity === 'Many') {
                    value = [];
                }
                formRels[mr.id] = { Value: value};
            });
        } else {
            const { bizAttributes, outgoingRelations } = this.props.bizObject;
            
            // Attributes
            metaAttrs.map(ma => {
                let value: string = '';
                for (let i = 0; i < bizAttributes.length; i++) {
                    if (ma.id === bizAttributes[i].metaAttribute.id) {
                        value = bizAttributes[i].value;
                        break;
                    }
                }
                formAttrs[ma.id] = { Value: value };
            });

            // Relations
            this.bizrelIdMappings = new Array<BizRelMetaMapType>(0);
            var relMap = new Map<string, { Value: string | string[] }>();
            
            metaRels.map(mr => {
                let found = false;
                for (let i = 0; i < outgoingRelations.length; i++) {
                    if (mr.id === outgoingRelations[i].metaRelation.id) {
                        found = true;
                        let value = outgoingRelations[i].oppositeObject.id;
                        this.bizrelIdMappings.push({bizkey: outgoingRelations[i].id, metaRelationId: mr.id, oppositeObjectId: value});
                        if (mr.multiplicity === 'Many') {
                            if (relMap[mr.id] === undefined) {
                                relMap[mr.id] = [value];
                            } else {
                                relMap[mr.id].push(value);
                            }
                        } else {
                            formRels[mr.id] = { Value: value };                    
                            break;
                        }
                    }
                }
                if (!found) {  // Metarelation has no outgoing relations for the business object, add []
                    formRels[mr.id] = { Value: [] };                    
                }
            });
            // Fix rels with 'many' relations, map -> array
            for (var key in relMap) {
                if (relMap[key] !== undefined) {  // TSLint requires this! Read on StackOverflow
                    var relarr = [];                
                    for (let i = 0; i < relMap[key].length; i++) {
                        relarr.push(relMap[key][i]);
                    }
                    formRels[key] = { Value: relarr};
                }
            }
        }
        this.formInit = {
            bizAttributes: formAttrs,
            bizRelations: formRels
        };
/*        
        tslint:disable-next-line:no-console
        console.log(`Your init:\n\n${JSON.stringify(this.formInit, null, 2)}`);
*/                
        return this.formInit;
    }

    deleteBizRels = async (bizrels: string[]) => {
        try {
            for (let i = 0; i < bizrels.length; i++) {
                await this.props.deleteBR({
                    variables: {
                        bizRelId: bizrels[i], 
                    }
                });
            }

            // TODO: delete corresponding opposite business relation !!!

        } catch (err) {
            alert('Error when deleting business relations...\n' + err);
        }
    }

    addBizRels = async (added: BizRelPair[]) => {
        let { bizObject } = this.props;
        try {
            for (let i = 0; i < added.length; i++) {
                await this.props.createBR({
                    variables: {
                        incoming: bizObject.id,
                        oppositeObj: added[i].oppositeObject.id,
                        metarelation: added[i].metaRelation.id
                    }
                });
            }
        } catch (err) {
            alert('Error when creating business relations...\n' + err);
        }
    }

    addOppositeBizRels =  async (boId: string, outgoingRels: BizRelationsType[], added: BizRelPair[]) => {
        try {
            for (let i = 0; i < added.length; i++) {
                for (let j = 0; j < outgoingRels.length; j++) {
                    if (added[i].metaRelation.id === outgoingRels[j].metaRelation.id) {
                        await this.props.createBR({
                            variables: {
                                oppositeObj: boId,
                                incoming: added[i].oppositeObject.id,
                                metarelation: outgoingRels[j].metaRelation.oppositeRelation.id
                            }
                        });
                        break;
                    }
                }
            }
        } catch (err) {
            alert('Error when creating business relations...\n' + err);
        }
    }

    updateBizAttributes = async (relationPairs: UpdateBizRelPair[]) => {
        try {
            for (let i = 0; i < relationPairs.length; i++) {
                await this.props.updateBA({
                    variables: {
                        id: relationPairs[i].bizRelId,
                        value: relationPairs[i].value,
                    }
                });
            }
        } catch (e) {
            alert('Error when updating business attribute: ' + e);
        }
    }

    updateBizObject = async () => {
        try {
            await this.props.updateBO({
                variables: {
                    id: this.props.bizObject.id,
                    name: this.props.bizObject.name,
                },
                refetchQueries: [{
                    query: allBOQuery,
                    variables: { repoFullName: 'apollographql/apollo-client' },
                }],                
            });
        } catch (e) {
            alert('Error when updating business object: ' + e);
        }
    }

    onSave = async (values: BOEditFormData) => {
        try {
            if (this.props.newObject) {
                // Fix attributes for save
                const { bizAttributes, bizRelations } = values;
                var attrs = new Array<{metaAttribute: {id: string}, value: string}>(0);

                Object.keys(bizAttributes).forEach(metaId => {
                    attrs.push({metaAttribute: {id: metaId}, value: bizAttributes[metaId].Value});
                });
                // Fix relations for save
                var rels = this.relArrayToPairs(bizRelations);

                /*await*/
                this.props.createBO({
                    variables: {
                        id: this.props.metaobject.metaObject.id, 
                        name: 'TEST for removal', 
                        attrs: attrs,
                        state: 'Created',
                        rels: rels
                    },
                    /*refetchQueries: [{
                        query: allBOQuery,
                        // variables: { repoFullName: 'apollographql/apollo-client' },
                    },
                    {             
                            query: gql`
                        query updateCache {
                            allMetaRelations {
                                id
                                oppositeName
                                oppositeRelation {
                                    id
                                    oppositeName
                                }
                            }
                        }`
                    }],*/
                    update: (store, { data: { createBusinessObject }}) => {
                        // Read the data from the cache for this query.
                        const data: BizObjectsType = store.readQuery({query: allBOQuery });
                        // Add our new BO from the mutation to the beginning.
                        data.businessObjects.splice(0, 0, createBusinessObject);
                        // Write the data back to the cache.
                        store.writeQuery({ query: allBOQuery, data });
                    },
                }).then((response) => {
//                        setTimeout(() => {
                            this.addOppositeBizRels(
                                response.data.createBusinessObject.id, 
                                response.data.createBusinessObject.outgoingRelations, 
                                rels);      // Pick new BO first in list, see update above  
//                        }, 
//                                   5000);
//                    });
                });

/*
                // For the newly created object, create opposite relations!

                // tslint:disable-next-line:no-console
                console.log('new BO id: ' + newBO.allBusinessObjects[0].id);
               
                setTimeout(() => {
                    const newBO: BizObjectsType = apolloClient.readQuery({query: allBOQuery });
                    let len = newBO.allBusinessObjects.length - 1;
                    this.addOppositeBizRels(newBO.allBusinessObjects[len].id, newBO.allBusinessObjects[len].outgoingRelations, rels);      // Pick new BO first in list, see update above
                }, 
                           5000);
*/                
            } else {
                // Check changed attributes
                var changedAttributes = this.getUpdatedBizAttributes(values.bizAttributes, this.formInit.bizAttributes);
                // Check if relations added/deleted
                const { forDeletion, added } = this.getRelationChanges(this.formInit.bizRelations, values.bizRelations);

                // tslint:disable-next-line:no-console
                console.log('Rob added: ' + JSON.stringify(added));
                
                // tslint:disable-next-line:no-console
                console.log('Mapping array: ' + JSON.stringify(this.bizrelIdMappings));
                // tslint:disable-next-line:no-console
                console.log('Bizrelids to be deleted!! ' + JSON.stringify(forDeletion));

                await this.updateBizAttributes(changedAttributes);
                await this.addBizRels(added);
                await this.deleteBizRels(forDeletion);
                await this.updateBizObject();   // TODO: To get chache update! Only for prototyping!
                // await apolloClient.query<BizObjectsType>({ query: allBOQuery });  // Uppdaterar inte cachen!
                // TODO: OBS! updateBizObject() uppdaterar t.ex. inte ändrade attribut-texter som dyker upp i dropdowns!!!

                // TODO: vissa object har outgoingrelations men inte incomingrelations!!! Missar dubbelriktning?!?!?!?!
                // Måste jag själv skapa två BizRelations, för dubbelriktning!?

            }
        } catch (e) {
            alert('ONSAVE error: ' + e);
        }
    }

    getUpdatedBizAttributes = (newAttrs: AttrType, oldAttrs: AttrType): UpdateBizRelPair[] => {
        var updated = new Array<{metaId: string, value: string}>(0);
        Object.keys(oldAttrs).forEach(metaId => {
            if (oldAttrs[metaId].Value !== newAttrs[metaId].Value) {
                updated.push({ metaId: metaId, value: newAttrs[metaId].Value});
            }
        });
/*        // tslint:disable-next-line:no-console
        console.log(`UPDATED attributes :\n${JSON.stringify(updated, null, 0)}`);  */    
        let objAttrs = this.props.bizObject.bizAttributes;
        let changedBizAttrs = new Array<UpdateBizRelPair>(0);
        updated.forEach(metaRel => {
            for (let i = 0; i < objAttrs.length; i++ ) {
                if (metaRel.metaId === objAttrs[i].metaAttribute.id) {
                    changedBizAttrs.push({ bizRelId: objAttrs[i].id, value: metaRel.value});
                    break;
                }
            }
        });
        return changedBizAttrs;
    }

    getRelationChanges = (oldrels: RelType, newrels: RelType): { forDeletion: string[], added: BizRelPair[] } => {
        var newRels = this.relArrayToPairs(newrels);
        var oldRels = this.relArrayToPairs(oldrels);

        var deleted = this.diffDeleted(oldRels, newRels);
        var added = this.diffDeleted(newRels, oldRels);
        
        let deleteBizRels = new Array<string>(0);
        deleted.forEach(element => {
            for (let i = 0; i < this.bizrelIdMappings.length; i++) {
                if (
                    element.metaRelation.id === this.bizrelIdMappings[i].metaRelationId && 
                    element.oppositeObject.id === this.bizrelIdMappings[i].oppositeObjectId) {
                        deleteBizRels.push(this.bizrelIdMappings[i].bizkey);
                        break;
                }
            }
        });
/*
        // tslint:disable-next-line:no-console
        console.log(`OLD :\n${JSON.stringify(oldRels, null, 2)}`);      
        // tslint:disable-next-line:no-console
        console.log(`NEW :\n${JSON.stringify(newRels, null, 2)}`);      
*/
        return { forDeletion: deleteBizRels, added: added };
    }
        
    // from {metarelId, [objid]} -> [metarelId, objid}]
    relArrayToPairs = (relations: RelType): Array<BizRelPair> => {
        var relPairs = new Array<BizRelPair>(0);

        Object.keys(relations).forEach(metaId => {
            if (Array.isArray(relations[metaId].Value)) {
                for (let e = 0; e < relations[metaId].Value.length; e++) {
                    relPairs.push({metaRelation: {id: metaId}, oppositeObject: {id: relations[metaId].Value[e]}});
                }
            } else {
                relPairs.push({metaRelation: {id: metaId}, oppositeObject: {id: relations[metaId].Value as string}});
            }
        });
        return relPairs;
    }

    diffDeleted = (source: Array<BizRelPair>, compare: Array<BizRelPair>): Array<BizRelPair> => {
        var deleted = new Array<BizRelPair>(0);
        source.forEach(el => {
            if (compare.findIndex(element => {return JSON.stringify(element) === JSON.stringify(el); }) === -1) {
                deleted.push(el);
            }
        });
        return deleted;
    }

    showResults = (values: BOEditFormData) => {
        // tslint:disable-next-line:no-console
        console.log(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
        window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
    }

    render() {
        return (
            <BOEditForm
                newObject={this.props.newObject}
                onSubmit={this.onSave}
                metaObject={this.props.metaobject}
                bizObject={this.props.newObject ? null : this.props.bizObject}
                initialValues={this.fromBOToForm(this.props.newObject)}
            />
        );
    }
}

type MyProps = {
    newObject: boolean;
    metaobject: MOResponse;
    bizObject?: BOEditType; 
};
interface MyMutations {
    updateBO: MutationFunc<{ id: string; }>;
    updateBA: MutationFunc<{ id: string; }>;
    createBR: MutationFunc<{ id: string; }>;
    deleteBR: MutationFunc<{ id: string; }>;
    createBO: MutationFunc<TEST>;
}

export default compose(
    graphql<{}, MyProps>(updateBizObject, { name: 'updateBO' }),
    graphql<{}, MyProps>(updateBizAttribute, { name: 'updateBA' }),
    graphql<{}, MyProps>(createBizRelation, { name: 'createBR' }),
    graphql<{}, MyProps>(deleteBizRelation, { name: 'deleteBR' }),
    graphql<{}, MyProps>(createBizObject, { name: 'createBO'})  
)(EditBOView);
