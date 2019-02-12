import * as React from 'react';
import { client } from '../../../../index';

import { graphql, ChildProps, compose, MutationFunc, FetchResult } from 'react-apollo';
import gql from 'graphql-tag';
import { allBOQuery, createBizObject, deleteBizRelation, createBizRelation, updateBizAttribute, updateBizObject,
        updateBizRelation, findBizRelation, createBRWithoutOpprelation , updateBRWithOppRel } from './queries';

import { MOResponse, BOEditType, BizRelationsType, BizAttributeType, FormValues, FormRelation, FormAttribute, BizObjectsType, AllMRResponse } from './Types';

import { BOEditForm } from './BOEditForm';

const allBizRels = gql`
query allBizRels($MRID: ID, $INCOBJID: ID, $OPPOBJID: ID) {
    bizRelations( where: {
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
                this.props.allMetaRels.metaRelations.map(mr => {
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
                    if (data.bizRelations.length > 0) {
                        // tslint:disable-next-line:no-console
                        console.log('Opposite BIZREL ID: ' + data.bizRelations[0].id);
                        await this.props.deleteBR({
                            variables: {
                                bizRelId: data.bizRelations[0].id, 
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

    addBizRels = async (added: BizRelPair[]) => {  // Used when adding relations to existing bizobject
        let { bizObject } = this.props;
        try {
            for (let i = 0; i < added.length; i++) {

                // tslint:disable-next-line:no-console
                console.log('STEP 1...');

                await this.props.createBRWithoutOpprel({
                    variables: {
                        incomingId: bizObject.id,
                        oppositeObjId: added[i].oppositeObjectId,
                        metarelationId: added[i].metaRelationId
                    }
                }).then(async (response: FetchResult<{createBizRelation: {id: string}}>) => {
                    // Add opposite relation
                
                    // tslint:disable-next-line:no-console
                    console.log('STEP 2...... Skapat ny BR: ', response.data.createBizRelation.id);

                    await this.addOneOppositeBizRel(bizObject.id, added[i], response.data.createBizRelation.id);

                    // tslint:disable-next-line:no-console
                    console.log('STEP 3.........');
                });

                // tslint:disable-next-line:no-console
                console.log('STEP 4......');

            }
        } catch (err) {
            alert('Error when adding new business relations...\n' + err);
        }
    }

    addOppositeBizRels =  async (boId: string, outgoingRels: BizRelationsType[]) => {  // Used after creating new bizobject
        try {
            for (let i = 0; i < outgoingRels.length; i++) {
                await this.addOneOppositeBizRel(
                    boId,
                    { metaRelationId: outgoingRels[i].metaRelation.id, oppositeObjectId: outgoingRels[i].oppositeObject.id},
                    outgoingRels[i].id);
            }
        } catch (err) {
            alert('Error when creating opposite business relations...\n' + err);
        }
    }

    connectOppRels = async (incomingId: string, oppositeObjId: string, metarelationId: string, incomingBizrelId: string) => {
        try {
            await this.props.createBR({
                variables: {
                    incomingId: incomingId,
                    oppositeObjId: oppositeObjId,
                    metarelationId: metarelationId,
                    opprelId: incomingBizrelId
                }
            }).then(async (response: FetchResult<{createBizRelation: { id: string; }}>) => {
                await this.props.updateBROppRel({
                    variables: {
                        id: incomingBizrelId,
                        oppRelId: response.data.createBizRelation.id,
                    }
                });
            });
        } catch (e) {
            alert('Error when creating opposite business relations...\n' + e);
        }
    }

    addOneOppositeBizRel = async (boId: string, added: BizRelPair, incomingBizrelId: string) => {
        try {
            for (let mr = 0; mr < this.props.allMetaRels.metaRelations.length; mr++) {
                var rel = this.props.allMetaRels.metaRelations[mr];
                if (rel.id === added.metaRelationId) {
                    if (rel.oppositeRelation.multiplicity === 'Many') {
                        // tslint:disable-next-line:no-console
                        console.log('Opposite relation multiplicity = MANY...CREATE a new Bizrelation');
                        await this.connectOppRels(added.oppositeObjectId, boId, rel.oppositeRelation.id, incomingBizrelId);
                    } else {

                        // tslint:disable-next-line:no-console
                        console.log('Searching for existing old opposite Bizrelation!!! MR & BO', rel.oppositeRelation.id, added.oppositeObjectId);

                        const { data: { bizRelations: result } } = await client.query({
                            query: findBizRelation,
                            fetchPolicy: 'network-only',
                            variables: { metaid: rel.oppositeRelation.id, oppBoId: added.oppositeObjectId }
                        });

                        if (result.length > 0) {
                            // tslint:disable-next-line:no-console
                            console.log('Found existing old opposite Bizrelation!!! ', result[0].oppositeRelation);
                            // tslint:disable-next-line:no-console
                            console.log('Removing existing old opposite Bizrelation!!! ', result[0].oppositeRelation.id);
                            await this.props.deleteBR({
                                variables: {
                                    bizRelId: result[0].oppositeRelation.id 
                                }
                            });
                            /*// tslint:disable-next-line:no-console
                            console.log('Opposite relation multiplicity = ONE...UPDATE existing Bizrelation: ', result[0].id);
                            await this.props.updateBR({
                                variables: {
                                    brid: result[0].id, oppBoId: boId, oppRelId: incomingBizrelId
                                }
                            });*/
                            // tslint:disable-next-line:no-console
                            console.log('Deleting single side relation NEW STUFF ', result[0].id);
                            await this.props.deleteBR({
                                variables: {
                                    bizRelId: result[0].id 
                                }
                            });
                            // tslint:disable-next-line:no-console
                            console.log('Connecting opp by ONE...CREATE a new Bizrelation');
                            await this.connectOppRels(added.oppositeObjectId, boId, rel.oppositeRelation.id, incomingBizrelId);

                        } else {
                            // tslint:disable-next-line:no-console
                            console.log('Opposite relation multiplicity = ONE...CREATE a new Bizrelation');
                            await this.connectOppRels(added.oppositeObjectId, boId, rel.oppositeRelation.id, incomingBizrelId);
                        }
                    }
                  
                    break;
                }
            }
        } catch (err) {
            // alert('Error when creating business relations...\n' + err);
            // tslint:disable-next-line:no-console
            console.log('-----------------> Error when creating business relations...\n' + err);
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
                var attrs = new Array<{metaAttribute: {connect: {id: string}}, value: string}>(0);
                let objName = ''; // RH temporary solution to the naming issue...

                bizAttributes.map(attr => {
                    attrs.push({metaAttribute: {connect: {id: attr.maid}}, value: attr.bizattrval});
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
                        moid: this.props.metaobject.metaObject.id, 
                        name: objName, 
                        attrs: attrs,
                        state: 'Created',
                        rels: null
                    },
                    // refetchQueries: [{
                    //    query: allBOQuery,
                    // }],
                    update: (store, { data: { createBusinessObject }}) => {   // RH TODO: säkerställ att cachen uppdateras utan att korrumperas!!!! Inte bra här anar jag...
                        // Read the data from the cache for this query.
                        const data: BizObjectsType = store.readQuery({query: allBOQuery });
                        // Add our new BO from the mutation to the beginning.
                        data.businessObjects.splice(0, 0, createBusinessObject);
                        // Write the data back to the cache.
                        store.writeQuery({ query: allBOQuery, data });
                    },
                }).then((response: FetchResult<CreateBOResult>) => {
                    // For the newly created object, create opposite relations!
                    this.addOppositeBizRels(
                        response.data.createBusinessObject.id, 
                        response.data.createBusinessObject.outgoingRelations
                    );
                });
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
            if (typeof mo.bizrelbizobjs === 'string' && mo.bizrelbizobjs !== '') {
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
    updateBROppRel: MutationFunc<{ id: string; }>;
    createBRWithoutOpprel: MutationFunc<{ id: string; }>;
    updateBR: MutationFunc<{ id: string; }>;
    updateBO: MutationFunc<{ id: string; }>;
    updateBA: MutationFunc<{ id: string; }>;
    createBR: MutationFunc<{ id: string; }>;
    deleteBR: MutationFunc<{ id: string; }>;
    createBO: MutationFunc<CreateBOResult>;
}

export default compose(
    graphql<{}, MyProps>(updateBRWithOppRel, { name: 'updateBROppRel' }),
    graphql<{}, MyProps>(createBRWithoutOpprelation, { name: 'createBRWithoutOpprel' }),
    graphql<{}, MyProps>(updateBizRelation, { name: 'updateBR' }),
    graphql<{}, MyProps>(updateBizObject, { name: 'updateBO' }),
    graphql<{}, MyProps>(updateBizAttribute, { name: 'updateBA' }),
    graphql<{}, MyProps>(createBizRelation, { name: 'createBR' }),
    graphql<{}, MyProps>(deleteBizRelation, { name: 'deleteBR' }),
    graphql<{}, MyProps>(createBizObject, { name: 'createBO'})  
)(EditBOView);
