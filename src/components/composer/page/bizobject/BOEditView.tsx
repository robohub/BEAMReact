import * as React from 'react';
import { client } from '../../../../index';

import { graphql, ChildProps, compose, MutationFunc, FetchResult } from 'react-apollo';
import gql from 'graphql-tag';
import { allBOQuery, deleteBizRelation, createBizRelation, updateBizAttribute, updateBizObject } from './queries';
// import BOEditForm from './BOEditForm';
import { MOResponse, BOEditType, BizRelationsType, BizAttributeType, FormValues, FormRelation, FormAttribute, BizObjectsType, AllMRResponse, MetaRel } from './Types';

import { BOEditForm } from './BOEditForm';

// import { client as apolloClient } from '../../../../index';
// import * as diff from 'deep-diff';

const createBizObject = gql`
mutation CreateBO (
    $id: ID!, 
    $name: String!, 
    $state: String!,
    $attrs: [BusinessObjectbizAttributesBizAttribute!],
    $rels: [BusinessObjectoutgoingRelationsBizRelation!]    
) 
{
    createBusinessObject(
        metaObjectId: $id,
        name: $name,
        state: $state,
        bizAttributes: $attrs,
        outgoingRelations: $rels
    )
    {
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
                multiplicity
                oppositeName
                oppositeRelation {
                    id
                }
            }
        }
    }
}
`;

const allBizRels = gql`
query allBizRels($MRID: ID, $INCOBJID: ID, $OPPOBJID: ID) {
    allBizRelations( filter: {
        metaRelation: {
          id: $MRID
        },
        incomingObject: {
            id: $INCOBJID
        },
        oppositeObject: {
          id: $OPPOBJID
        }
      }) {
          id
      }
  }
`;

interface CreateBOResult {
    createBusinessObject: BOEditType;
}

type BizRelPair = { metaRelationId: string, oppositeObjectId: string, bizrelId?: string };
type UpdateBizRelPair = { bizRelId: string, value: string };

class EditBOView extends React.Component<ChildProps<MyProps & MyMutations, CreateBOResult>> {
    
    deleteBizRels = async (bizrels: BizRelPair[]) => {
        try {
            for (let i = 0; i < bizrels.length; i++) {

                // DELETE Opposite relation 

                let found = false;
                var oppositeMRId: string;
                this.props.allMetaRels.allMetaRelations.map(mr => {
                    if (mr.id === bizrels[i].metaRelationId) {
                        found = true;
                        oppositeMRId = mr.oppositeRelation.id;
                        // tslint:disable-next-line:no-console
                        console.log('Opposite MR id: ' + oppositeMRId);
                    }
                });
                if (found) {
                    const { data } = await client.query({
                        query: allBizRels,
                        fetchPolicy: 'network-only',
                        variables: { MRID: oppositeMRId, INCOBJID: bizrels[i].oppositeObjectId, OPPOBJID: this.props.bizObject.id }
                    });
                    if (data.allBizRelations.length > 0) {
                        // tslint:disable-next-line:no-console
                        console.log('Opposite BIZREL ID: ' + data.allBizRelations[0].id);
                        await this.props.deleteBR({
                            variables: {
                                bizRelId: data.allBizRelations[0].id, 
                            }
                        });
                    }
                }

                await this.props.deleteBR({
                    variables: {
                        bizRelId: bizrels[i].bizrelId, 
                    }
                });
            }
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
                        oppositeObj: added[i].oppositeObjectId,
                        metarelation: added[i].metaRelationId
                    }
                });
                // ADD opposite relation 
                let found = false;
                var rel: MetaRel;
                this.props.allMetaRels.allMetaRelations.map(mr => {
                    if (mr.id === added[i].metaRelationId) {
                        found = true;
                        rel = mr;
                    }
                });
                if (found) {
                    await this.props.createBR({
                        variables: {
                            incoming: added[i].oppositeObjectId,
                            oppositeObj: bizObject.id,
                            metarelation: rel.oppositeRelation.id
                        }
                    });                    
                }
            }
        } catch (err) {
            alert('Error when creating business relations...\n' + err);
        }
    }

addOppositeBizRels =  async (boId: string, outgoingRels: BizRelationsType[], added: BizRelPair[]) => {
        try {
            for (let i = 0; i < added.length; i++) {
                for (let j = 0; j < outgoingRels.length; j++) {
                    if (added[i].metaRelationId === outgoingRels[j].metaRelation.id) {
                        await this.props.createBR({
                            variables: {
                                oppositeObj: boId,
                                incoming: added[i].oppositeObjectId,
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

onSave = async (values: FormValues) => {
        try {
            if (this.props.newObject) {
                // Fix attributes for save
                const { bizAttributes, bizRelations } = values;
                var attrs = new Array<{metaAttributeId: string, value: string}>(0);
                let objName = ''; // RH temporary solution to the naming issue...

                bizAttributes.map(attr => {
                    attrs.push({metaAttributeId: attr.maid, value: attr.bizattrval});
                    if (attr.name === 'Name') { objName = attr.bizattrval; }
                });

                // Fix relations for save
                var rels = new Array<{metaRelationId: string, oppositeObjectId: string}>(0);

                bizRelations.map(rel => {
                    if (typeof rel.bizrelbizobjs === 'string' && rel.bizrelbizobjs !== '') {
                        rels.push({metaRelationId: rel.metarelid, oppositeObjectId: rel.bizrelbizobjs as string});
                    } else {
                        for (let e = 0; e < rel.bizrelbizobjs.length; e++) {
                            rels.push({metaRelationId: rel.metarelid, oppositeObjectId: rel.bizrelbizobjs[e]});
                        }
                    }
                });

                // tslint:disable-next-line:no-console
                console.log('Namn; ' + objName);
                // tslint:disable-next-line:no-console
                console.log('Relations: ' + JSON.stringify(rels));

                // await
                this.props.createBO({
                    variables: {
                        id: this.props.metaobject.MetaObject.id, 
                        name: objName, 
                        attrs: attrs,
                        state: 'Created',
                        rels: rels
                    },
//                    refetchQueries: [{
//                        query: allBOQuery,
//                        // variables: { repoFullName: 'apollographql/apollo-client' },
//                    },
//                    {             
//                            query: gql`
//                        query updateCache {
//                            allMetaRelations {
//                                id
//                                oppositeName
//                                oppositeRelation {
//                                    id
//                                    oppositeName
//                                }
//                            }
//                        }`
//                    }],
                    update: (store, { data: { createBusinessObject }}) => {
                        // Read the data from the cache for this query.
                        const data: BizObjectsType = store.readQuery({query: allBOQuery });
                        // Add our new BO from the mutation to the beginning.
                        data.allBusinessObjects.splice(0, 0, createBusinessObject);
                        // Write the data back to the cache.
                        store.writeQuery({ query: allBOQuery, data });
                    },
                }).then((response: FetchResult<CreateBOResult>) => {
                    // tslint:disable-next-line:no-console
                    console.log('Response: ', response);
                    // tslint:disable-next-line:no-console
                    console.log('Object: ', response.data.createBusinessObject);
            //                        setTimeout(() => {
                    /*this.addOppositeBizRels(
                        response.data.createBusinessObject.id, 
                        response.data.createBusinessObject.outgoingRelations, 
                        rels
                    );   */
                       // Pick new BO first in list, see update above  
            //                        }, 
            //                                   5000);
            //                    });
                });

                // For the newly created object, create opposite relations!

                // tslint:disable-next-line:no-console
//                console.log('new BO id: ' + newBO.allBusinessObjects[0].id);
               
//                setTimeout(() => {
//                    const newBO: BizObjectsType = apolloClient.readQuery({query: allBOQuery });
//                    let len = newBO.allBusinessObjects.length - 1;
//                    this.addOppositeBizRels(newBO.allBusinessObjects[len].id, newBO.allBusinessObjects[len].outgoingRelations, rels);      // Pick new BO first in list, see update above
//                }, 
//                           5000);

            } else {
                // Check changed attributes
                var changedAttributes = this.getUpdatedBizAttributes(values.bizAttributes, this.props.bizObject.bizAttributes);
                // Check if relations added/deleted
                const { forDeletion, added } = this.getRelationChanges(this.props.bizObject.outgoingRelations, values.bizRelations);

                // tslint:disable-next-line:no-console
                console.log('Rob added: ' + JSON.stringify(added));
                
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

getUpdatedBizAttributes = (newAttrs: FormAttribute[], oldAttrs: BizAttributeType[]): UpdateBizRelPair[] => {
        var updated = new Array<{metaId: string, value: string}>(0);
        oldAttrs.forEach(oldBO => {
            newAttrs.forEach(newBO => {
                if (newBO.maid === oldBO.metaAttribute.id) {
                    if (newBO.bizattrval !== oldBO.value) {
                        updated.push({ metaId: newBO.maid , value: newBO.bizattrval});
                    }
                }
            });
        });
        // tslint:disable-next-line:no-console
        console.log(`UPDATED attributes :\n${JSON.stringify(updated, null, 0)}`);   
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

getRelationChanges = (oldrels: BizRelationsType[], newrels: FormRelation[]): { forDeletion: BizRelPair[], added: BizRelPair[] } => {
        var newrelPairs = new Array<BizRelPair>(0);
        var oldrelPairs = new Array<BizRelPair>(0);

        newrels.map(mo => {
            if (typeof mo.bizrelbizobjs === 'string') {
                newrelPairs.push({metaRelationId: mo.metarelid, oppositeObjectId: mo.bizrelbizobjs as string});
            } else {
                for (let e = 0; e < mo.bizrelbizobjs.length; e++) {
                    newrelPairs.push({metaRelationId: mo.metarelid, oppositeObjectId: mo.bizrelbizobjs[e]});
                }
            }
        });

        oldrels.map(br => {
            oldrelPairs.push({metaRelationId: br.metaRelation.id, oppositeObjectId: br.oppositeObject.id, bizrelId: br.id});
        });

        var deleted = this.diffDeleted(oldrelPairs, newrelPairs);
        var added = this.diffDeleted(newrelPairs, oldrelPairs);

        // tslint:disable-next-line:no-console
        // console.log(`OLD :\n${JSON.stringify(oldrels, null, 2)}`);      
        // tslint:disable-next-line:no-console
        // console.log(`NEW :\n${JSON.stringify(newrels, null, 2)}`);      

        return { forDeletion: deleted, added: added };
    }

diffDeleted = (source: Array<BizRelPair>, compare: Array<BizRelPair>): Array<BizRelPair> => {
        var deleted = new Array<BizRelPair>(0);
        source.forEach(el => {
            let sourceObj = { metaRelationId: el.metaRelationId, oppositeObjectId: el.oppositeObjectId }; // Remove field bizRelId from object to compare correctly
            if (compare.findIndex(element => {
                let compObj = { metaRelationId: element.metaRelationId, oppositeObjectId: element.oppositeObjectId }; // Remove field bizRelId from object to compare correctly
                return JSON.stringify(sourceObj) === JSON.stringify(compObj); })
            === -1) {
                deleted.push(el);
            }
        });
        return deleted;
    }

showResults = (input: FormValues) => {
        // tslint:disable-next-line:no-console
        console.log(`You submitted:\n\n${JSON.stringify(input, null, 2)}`);
        window.alert('Klar med edit av BO!');
    }

handleTabChange = (e: React.ChangeEvent, value: number) => {
        this.setState( {tabval: value});
    }

render() {
        return (
            <BOEditForm
                newObject={this.props.newObject}
                onSubmit={this.onSave}
                // onSubmit={this.showResults}
                metaObject={this.props.metaobject}
                bizObject={this.props.newObject ? null : this.props.bizObject}
            />
        );
    }
}

type MyProps = {
    newObject: boolean;
    metaobject: MOResponse;
    bizObject?: BOEditType;
    allMetaRels: AllMRResponse;
};

interface MyMutations {
    updateBO: MutationFunc<{ id: string; }>;
    updateBA: MutationFunc<{ id: string; }>;
    createBR: MutationFunc<{ id: string; }>;
    deleteBR: MutationFunc<{ id: string; }>;
    createBO: MutationFunc<CreateBOResult>;
}

export default compose(
    graphql<{}, MyProps>(updateBizObject, { name: 'updateBO' }),
    graphql<{}, MyProps>(updateBizAttribute, { name: 'updateBA' }),
    graphql<{}, MyProps>(createBizRelation, { name: 'createBR' }),
    graphql<{}, MyProps>(deleteBizRelation, { name: 'deleteBR' }),
    graphql<{}, MyProps>(createBizObject, { name: 'createBO'})  
)(EditBOView);
