import { client } from '../../index';
import { FetchResult } from 'react-apollo';

import { MetaObjectType } from './../../components/composer/page/bizobject/Types';

import { allBOQuery, /*upsertBO, allMOQuery, MOQuery,*/ updateBRWithOppRel, createBizRelation, deleteBRPairs, MOQuery, /*updateManyBRValues*/ } from '../../components/composer/page/bizobject/queries';

// export type BizRelPentax = { mrId: string, boId: string, brId?: string, oppBRid?: string, oppMRid?: string };

export type BizAttrValueType = { brId: string, value: string };
export type RelatedBOType = { mrId: string, boId: string};
export type RelatedBAType = {maId: string, value: string};

export interface ExtendedRelBOType extends RelatedBOType {
    brId?: string;  // Used when deleting existing relations
    oppMRid?: string;  // Used when adding existing relations and their opposite relations
    oppBRid?: string;  // Used deleting opposite and indirect relations
}

export type BizAttributeType = {
    id: string;
    metaAttribute: { 
        id: string;
        name: string 
    }
    value: string;
};

export type BizRelationsType = {
    id: string;

    oppositeObject: {
        id: string;
        name: string;
    }
    oppositeRelation: {
        id: string
    }
    metaRelation: {
        id: string;
        oppositeName: string;
        multiplicity: string;
    }
};

export type BOEditType = {
    id: string;
    name: string;
    state: string;
    metaObject: { 
        id: string;
        name: string  
    };
    bizAttributes: BizAttributeType[];
    outgoingRelations: BizRelationsType[];
};

export type BizObjectsType = {
    businessObjects: BOEditType[];
};

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

export const findIndirectDeletions = async (createRels: RelatedBOType[], moId: string) => {
    let indirectRels = new Array<string>();

    let result = await client.query({
        query: MOQuery,
        variables: {id: moId}
    });
    let metaobject = result.data.metaObject as MetaObjectType;  // To be able to find opposite relation ids

    createRels.map(added => {
        metaobject.outgoingRelations.forEach(mRel => {
            let found = false;
            if (mRel.id === added.mrId) {
                mRel.oppositeObject.businessObjects.forEach(oppBo => {
                    if (oppBo.id === added.boId && oppBo.outgoingRelations.length && oppBo.outgoingRelations[0].metaRelation.multiplicity === 'One') {
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
        try {
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
        } catch {
            // Do nothing - probably landing here when saving BO before query yet in store 'allBOQuery' called from e.g. Composer)
        }

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

export const syncCreateAndConnectOppositeBizRels = async (newBO: BOEditType, createRels: ExtendedRelBOType[]) => {
    let singleCreateConnectPromises = new Array<Promise<void>>();

    createRels.map(newRel => {
        newBO.outgoingRelations.forEach(async dbRel => {
            if (dbRel.metaRelation.id === newRel.mrId && dbRel.oppositeObject.id === newRel.boId) {
                let promise = createAndConnectOppositeBizRels(newRel.boId, newBO.id, newRel.oppMRid, dbRel.id);
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

export function getUpdatedBizAttributes(newAttrs: RelatedBAType[], oldAttrs: BizAttributeType[]): BizAttrValueType[] {
    
    let changedBizAttrs = new Array<BizAttrValueType>();
    // var updated = new Array<{metaId: string, value: string}>();
    oldAttrs.forEach(oldBA => {
        newAttrs.forEach(newBA => {
            if (newBA.maId === oldBA.metaAttribute.id && newBA.value !== oldBA.value) {
                changedBizAttrs.push({ brId: oldBA.id, value: newBA.value});
            }
        });
    });
    
    // tslint:disable-next-line:no-console
    console.log(`UPDATED attributes :\n${JSON.stringify(changedBizAttrs, null, 0)}`);
/*
    let changedBizAttrs = new Array<BizAttrValueType>(0);
    updated.forEach(metaRel => {
        for (let i = 0; i < oldAttrs.length; i++ ) {
            if (metaRel.metaId === oldAttrs[i].metaAttribute.id) {
                changedBizAttrs.push({ brId: oldAttrs[i].id, value: metaRel.value});
                break;
            }
        }
    });*/
    return changedBizAttrs;
}

export function getChangedRelations(oldrels: BizRelationsType[], newrels: RelatedBOType[]): {added: ExtendedRelBOType[], toDelete: ExtendedRelBOType[]} {
    var oldrelsConverted = new Array<ExtendedRelBOType>();

    const getDeletedBOs = (initBOs: RelatedBOType[], compareBOs: RelatedBOType[]) => {
        let deleted = new Array<RelatedBOType>();
        initBOs.map(old => {
            let found = false;
            compareBOs.forEach(comp => {
                if (old.boId === comp.boId && old.mrId === comp.mrId) {
                    found = true;
                    return;
                }
            });
            if (!found) { deleted.push(old); }
        });
        return deleted;
    };

    oldrels.map(br => {
        oldrelsConverted.push({mrId: br.metaRelation.id, boId: br.oppositeObject.id, brId: br.id, oppBRid: br.oppositeRelation.id});
    });

    var toDelete = getDeletedBOs(oldrelsConverted, newrels);
    var added = getDeletedBOs(newrels, oldrelsConverted);

    return {toDelete, added};
}
