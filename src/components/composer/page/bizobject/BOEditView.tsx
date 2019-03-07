import * as React from 'react';
import { client } from '../../../../index';

import { graphql, ChildProps, compose, MutationFunc, FetchResult } from 'react-apollo';
import gql from 'graphql-tag';
import { /*allBOQuery,*/ upsertBO, deleteBizRelation, createBizRelation, updateBizAttribute, updateBizObject,
        updateBizRelation, findBizRelation, createBRWithoutOpprelation , updateBRWithOppRel } from './queries';

import { MOResponse, BOEditType, BizRelationsType, BizAttributeType, FormValues, FormRelation, FormAttribute, /*BizObjectsType,*/ AllMRResponse } from './Types';

import { BOEditForm } from './BOEditForm';
/*
const allBizRels = gql`
query getAllBizRels {
bizRelations {
  id
  incomingObject { id name }
  oppositeObject { id name }
}
}
`;
*/
const deleteBRPairs = gql`
mutation deleteBRPairs($brids:[ID!]) {
    deleteManyBizRelations (
       where: {id_in: $brids}
    ) {
       count
    }
}
 `; 

interface UpsertBOResult {
    upsertBusinessObject: BOEditType;
}

type BizRelPenta = { mrid: string, oppositeObjectId: string, bizrelId?: string, oppBRid?: string, oppMRid?: string };
type UpdateBizRelPair = { bizRelId: string, value: string };

class EditBOView extends React.Component<ChildProps<MyProps & MyMutations>> {
/*
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
*/
    onSave = async (values: FormValues) => {
        const { newObject, bizObject } = this.props;
        const { bizAttributes, bizRelations } = values;

        let attrs = new Array<{metaAttribute: {connect: {id: string}}, value: string}>();

        let createRels = new Array<BizRelPenta>();
        let deleteRels = new Array<BizRelPenta>();

        let objName = ''; // RH TODO temporary solution to the naming issue...

        // 1. Find the added and deleted DIRECT relations
        
        if (newObject) {
            // Fix attributes for save
            bizAttributes.map(attr => {
                attrs.push({metaAttribute: {connect: {id: attr.maid}}, value: attr.bizattrval});
                if (attr.name === 'Name') { objName = attr.bizattrval; }
            });

            bizRelations.map(rel => {
                if (typeof rel.bizrelbizobjs === 'string' && rel.bizrelbizobjs !== '') {
                    createRels.push({mrid: rel.metarelid, oppositeObjectId: rel.bizrelbizobjs as string});
                } else {
                    for (let e = 0; e < rel.bizrelbizobjs.length; e++) {
                        createRels.push({mrid: rel.metarelid, oppositeObjectId: rel.bizrelbizobjs[e]});
                    }
                }
            });
        } else {
            var changedAttributes = this.getUpdatedBizAttributes(values.bizAttributes, this.props.bizObject.bizAttributes);
            this.updateBizAttributes(changedAttributes);

            const { added, toDelete } = this.getChangedRelations(bizObject.outgoingRelations, bizRelations);
            createRels = added;
            deleteRels  = toDelete;
        }

        createRels.forEach(rel => {   // Find opposite meta relation id for when creating opposite relations later on...
            this.props.allMetaRels.metaRelations.forEach(mr => {
                if (rel.mrid === mr.id) {
                    rel.oppMRid = mr.oppositeRelation.id;
                    return;
                }
            });            
        });

        // 2. Add, if any, INDIRECT relations to be deleted
        const indirectRels = await this.findIndirectDeletions(createRels);
        deleteRels = deleteRels.concat(indirectRels);
        
        // tslint:disable-next-line:no-console
        console.log('Added: ' + JSON.stringify(createRels, null, 2));
        // tslint:disable-next-line:no-console
        console.log('Deleted: ' + JSON.stringify(deleteRels, null, 2));
    
        // 3. deleteBRPairs(delRels)

        //      3.1 Prepare ids[] with brid and oppositebrid pairs
        var deleteRelIds = new Array<string>();  // Filter out ids
        deleteRels.map(item => {
            deleteRelIds = deleteRelIds.concat([item.bizrelId, item.oppBRid]);
        });
        // tslint:disable-next-line:no-console
        console.log('Deleted STRING to mutation ' + JSON.stringify(deleteRelIds, null, 2));

        /* try { } catch ... */

        await client.mutate({
            mutation: deleteBRPairs,
            variables: {
                brids: deleteRelIds 
            },

        });
        // 4. upsertBO(createRels)

        var addedRels = new Array<{metaRelation: {connect: {id: string}}, oppositeObject: {connect: {id: string}}}>();
        createRels.map((item: BizRelPenta) => {
            addedRels.push({metaRelation: {connect: {id: item.mrid}}, oppositeObject: {connect: {id: item.oppositeObjectId}}});
        });

        // tslint:disable-next-line:no-console
        console.log('Nummer 0');

        await this.props.upsertBO({
            variables: {
                boid: newObject ? '' : bizObject.id,
                moid: this.props.metaobject.metaObject.id,
                name: objName, 
                attrs: attrs,
                state: 'Created',
                rels: addedRels
            },
            update: async (store, mutationResult ) => {
                const newBO = mutationResult.data.upsertBusinessObject;
                // tslint:disable-next-line:no-console
                console.log('Nummer 1 ');
                
                // tslint:disable-next-line:no-console
                console.log(store);
                
                // 5. Create and connect opposite biz relations
                await this.syncCreateAndConnectOppositeBizRels(newBO, createRels);

                // tslint:disable-next-line:no-console
                console.log(store);

                // tslint:disable-next-line:no-console
                console.log('Nummer 7: ');
                // Update cache...
                // const data: BizObjectsType = store.readQuery({query: allBOQuery });
                // data.businessObjects.splice(0, 0, newBO);
                // store.writeQuery({ query: allBOQuery, data });
                // client.resetStore();

            }
        });
        // tslint:disable-next-line:no-console
        console.log('Nummer 8');

    }

    getChangedRelations = (oldrels: BizRelationsType[], newrels: FormRelation[]): {added: BizRelPenta[], toDelete: BizRelPenta[]} => {
        var newrelPairs = new Array<BizRelPenta>(0);
        var oldrelPairs = new Array<BizRelPenta>(0);

        newrels.map(mo => {
            if (typeof mo.bizrelbizobjs === 'string' && mo.bizrelbizobjs !== '') {
                newrelPairs.push({mrid: mo.metarelid, oppositeObjectId: mo.bizrelbizobjs as string});
            } else {
                for (let e = 0; e < mo.bizrelbizobjs.length; e++) {
                    newrelPairs.push({mrid: mo.metarelid, oppositeObjectId: mo.bizrelbizobjs[e]});
                }
            }
        });

        oldrels.map(br => {
            oldrelPairs.push({mrid: br.metaRelation.id, oppositeObjectId: br.oppositeObject.id, bizrelId: br.id, oppBRid: br.oppositeRelation.id});
        });

        var deleted = this.diffDeletedRels(oldrelPairs, newrelPairs);
        var added = this.diffDeletedRels(newrelPairs, oldrelPairs);

        return {toDelete: deleted, added: added};
    }

    diffDeletedRels = (source: Array<BizRelPenta>, compare: Array<BizRelPenta>): BizRelPenta[] => {
        var deleted = new Array<BizRelPenta>();
        source.forEach(el => {
            let sourceObj = { mrid: el.mrid, oppositeObjectId: el.oppositeObjectId }; // Remove field bizRelId from object to compare correctly
            if (compare.findIndex(element => {
                let compObj = { mrid: element.mrid, oppositeObjectId: element.oppositeObjectId }; // Remove field bizRelId from object to compare correctly
                return JSON.stringify(sourceObj) === JSON.stringify(compObj); })
            === -1) {
                deleted.push(el);
            }
        });
        return deleted;
    }

    findIndirectDeletions = async (createRels: BizRelPenta[]) => {
        let singleFindBizrelPromises = new Array<Promise<BizRelPenta>>();

        createRels.map(added => {
            for (let mr = 0; mr < this.props.allMetaRels.metaRelations.length; mr++) {
                var rel = this.props.allMetaRels.metaRelations[mr];
                if (rel.id === added.mrid) {
                    if (rel.oppositeRelation.multiplicity === 'One') {
                        let promise = this.findBizrel(added.oppositeObjectId, rel.oppositeRelation.id);
                        singleFindBizrelPromises.push(promise);
                    }
                }
            }
        });
        const indirectDelRels = await Promise.all(singleFindBizrelPromises);
        return indirectDelRels.filter(el => {  // Remove elements with null (indirect relations not connected on "other" side)
            return el.bizrelId !== null;
        });
    }

    findBizrel = async (boid: string, mrid: string) => {
        const { data: { bizRelations: result } } = await client.query({
            query: findBizRelation,
            variables: { metaid: mrid, oppBoId: boid }
        });
        if (result.length > 0) {
            return ({bizrelId: result[0].oppositeRelation.id, oppBRid: result[0].id, mrid: '', oppositeObjectId: ''});
        } else {
            return {bizrelId: null, oppBRid: null, mrid: '', oppositeObjectId: ''};  // No connection on other side...
        }
    }

    syncCreateAndConnectOppositeBizRels = async (newBO: BOEditType, createRels: BizRelPenta[]) => {
        let singleCreateConnectPromises = new Array<Promise<void>>();

        // tslint:disable-next-line:no-console
        console.log('Nummer 2: ');

        createRels.map(newRel => {
            newBO.outgoingRelations.forEach(async dbRel => {
                if (dbRel.metaRelation.id === newRel.mrid && dbRel.oppositeObject.id === newRel.oppositeObjectId) {
                    
                    // tslint:disable-next-line:no-console
                    console.log('Nummer 3: ' + dbRel.id);
                    let promise = this.createAndConnectOppositeBizRels(newRel.oppositeObjectId, newBO.id, newRel.oppMRid, dbRel.id);
                    singleCreateConnectPromises.push(promise);
                    
                    // tslint:disable-next-line:no-console
                    console.log('Push promise 1');

                    return;
                }
            });
        });
        await Promise.all(singleCreateConnectPromises);
        // tslint:disable-next-line:no-console
        console.log('Nummer 6');
    }

    createAndConnectOppositeBizRels = async (incboid: string, oppboid: string, mrid: string, oppmrid: string ) => {
        // tslint:disable-next-line:no-any
        let singleCreationPromises = new Array<Promise<void | Record<string, any>>>();

        // tslint:disable-next-line:no-console
        console.log('Nummer 4');

        await this.props.createBR({
            variables: {
                incomingId: incboid,
                oppositeObjId: oppboid,
                metarelationId: mrid,
                opprelId: oppmrid
            }
        }).then(async (response: FetchResult<{createBizRelation: { id: string; }}>) => {
            let promise = this.props.updateBROppRel({
                variables: {
                    id: oppmrid,
                    oppRelId: response.data.createBizRelation.id,
                }
            });
            singleCreationPromises.push(promise);
            // tslint:disable-next-line:no-console
            console.log('Push promise 2');
        });
        await Promise.all(singleCreationPromises);
        // tslint:disable-next-line:no-console
        console.log('Nummer 5: ');

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
    upsertBO: MutationFunc<UpsertBOResult>;
}

export default compose(
    graphql<{}, MyProps>(updateBRWithOppRel, { name: 'updateBROppRel' }),
    graphql<{}, MyProps>(createBRWithoutOpprelation, { name: 'createBRWithoutOpprel' }),
    graphql<{}, MyProps>(updateBizRelation, { name: 'updateBR' }),
    graphql<{}, MyProps>(updateBizObject, { name: 'updateBO' }),
    graphql<{}, MyProps>(updateBizAttribute, { name: 'updateBA' }),
    graphql<{}, MyProps>(createBizRelation, { name: 'createBR' }),
    graphql<{}, MyProps>(deleteBizRelation, { name: 'deleteBR' }),
    graphql<{}, MyProps>(upsertBO, { name: 'upsertBO'})
)(EditBOView);
