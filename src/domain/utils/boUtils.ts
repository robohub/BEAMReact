import { client } from '../../index';
import { FetchResult } from 'react-apollo';

import { MOResponse, BOEditType, BizObjectsType, BizRelationsType, } from './../../components/composer/page/bizobject/Types';

import { allBOQuery, /*upsertBO, allMOQuery, MOQuery,*/ updateBRWithOppRel, createBizRelation, deleteBRPairs, /*updateManyBRValues*/ } from '../../components/composer/page/bizobject/queries';

export type BizRelPenta = { mrid: string, oppositeObjectId: string, bizrelId?: string, oppBRid?: string, oppMRid?: string };
export type UpdateBizAttrPair = { bizRelId: string, value: string };

/*
export const updateBizAttributes = async (boid: string, attrPairs: UpdateBizAttrPair[]) => {
    try {
        if (attrPairs.length) {
            let inputBrVals = new Array<{where: {id: string}, data: {value: string}}>(); 
            for (let i = 0; i < attrPairs.length; i++) {
                inputBrVals.push({where: {id: attrPairs[i].bizRelId}, data: {value: attrPairs[i].value}});
            }
            await client.mutate({
                mutation: updateManyBRValues,
                variables: {
                    id: boid,
                    brValues: inputBrVals,
                },
                update: () => {
                    const data: BizObjectsType = client.readQuery({query: allBOQuery });
                    data.businessObjects.forEach(bo => {
                        if (bo.id === boid) {
                            attrPairs.forEach(ap => {
                                bo.bizAttributes.forEach(ba => {
                                    if (ap.bizRelId  === ba.id) {
                                        ba.value = ap.value;
                                        return;
                                    }
                                });
                            });
                            return;
                        }
                    });
                    client.writeQuery({ query: allBOQuery, data });

                    // tslint:disable-next-line:no-console
                    console.log('Updated cache for changed attributes!! ####');
                }
            });
        }
    } catch (e) {
        alert('Error when updating business attribute: ' + e);
    }
};
*/

export const findIndirectDeletions = (createRels: BizRelPenta[], metaobject: MOResponse): string[] => {
    let indirectRels = new Array<string>();
    createRels.map(added => {
        metaobject.metaObject.outgoingRelations.forEach(mRel => {
            let found = false;
            if (mRel.id === added.mrid) {
                mRel.oppositeObject.businessObjects.forEach(oppBo => {
                    if (oppBo.id === added.oppositeObjectId && oppBo.outgoingRelations.length && oppBo.outgoingRelations[0].metaRelation.multiplicity === 'One') {
                        // These two BRs to be removed
                        indirectRels.push(oppBo.outgoingRelations[0].oppositeRelation.id);
                        indirectRels.push(oppBo.outgoingRelations[0].id);
                        found = true;
                        return;
                    }
                });
            }
            if (found)  { return; }
        });
    });
    return indirectRels;
};

const createAndConnectOppositeBizRels = async (incboid: string, oppboid: string, mrid: string, oppmrid: string ) => {
    // tslint:disable-next-line:no-any
    let singleCreationPromises = new Array<Promise<void | Record<string, any>>>();

    // tslint:disable-next-line:no-console
    console.log('1 starting BR creation...');
    await client.mutate({
        mutation: createBizRelation,
        variables: {
            incomingId: incboid,
            oppositeObjId: oppboid,
            metarelationId: mrid,
            opprelId: oppmrid
        }
    }).then(async (response: FetchResult<{createBizRelation: BizRelationsType}>) => {
        // tslint:disable-next-line:no-console
        console.log('2... CREATED IN DB, BR: ' + response.data.createBizRelation.id);

        // Update cache - add new BR to BO
        const data: BizObjectsType = client.readQuery({query: allBOQuery });
        const newBR = response.data.createBizRelation;
        data.businessObjects.forEach(bo => {
            if (bo.id === incboid) {
                if (newBR.metaRelation.multiplicity  === 'One') {
                    bo.outgoingRelations = [newBR];
                } else {
                    // tslint:disable-next-line:no-console
                    console.log('Updating cache: OPP BizRel ' + newBR);
                    bo.outgoingRelations.push(newBR);
                }
                return;
            }
        });
        client.writeQuery({ query: allBOQuery, data });

        let promise = client.mutate({
            mutation: updateBRWithOppRel,
            variables: {
                id: oppmrid,
                oppRelId: response.data.createBizRelation.id,
            },
            // tslint:disable-next-line:no-any
            update: (cache: any, result: { data: { updateBizRelation: { id: string; }; }; }) => {
                // tslint:disable-next-line:no-console
                console.log('3... Update for opposite relation ' + result.data.updateBizRelation.id, cache);
            }
        });
        singleCreationPromises.push(promise);
    });
    await Promise.all(singleCreationPromises);
    // tslint:disable-next-line:no-console
    console.log('B. Exits createAndConnectOppositeBizRels, all synced!!!.....');
};

export const syncCreateAndConnectOppositeBizRels = async (newBO: BOEditType, createRels: BizRelPenta[]) => {
    let singleCreateConnectPromises = new Array<Promise<void>>();

    createRels.map(newRel => {
        newBO.outgoingRelations.forEach(async dbRel => {
            if (dbRel.metaRelation.id === newRel.mrid && dbRel.oppositeObject.id === newRel.oppositeObjectId) {
                let promise = createAndConnectOppositeBizRels(newRel.oppositeObjectId, newBO.id, newRel.oppMRid, dbRel.id);
                singleCreateConnectPromises.push(promise);
                return;
            }
        });
    });
    await Promise.all(singleCreateConnectPromises);
    // tslint:disable-next-line:no-console
    console.log('A. Exits syncCreateAndConnectOppositeBizRels, all synced!!!.....');
};

export const deleteBizRelations = async (deleteRelIds: string[]) => {

    // tslint:disable-next-line:no-console
    console.log('Deleted STRING to mutation ' + JSON.stringify(deleteRelIds, null, 2));

    /* try { } catch ... */
    if (deleteRelIds.length > 0) {
        await client.mutate({
            mutation: deleteBRPairs,
            variables: {
                brids: deleteRelIds 
            },
        });
    }
    // tslint:disable-next-line:no-console
    console.log('D. Exits deleteBizRelations,.....');
    return deleteRelIds;
};
