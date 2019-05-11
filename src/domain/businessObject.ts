import gql from 'graphql-tag';

import { client } from '../index';

import { ExtendedRelBOType, BizAttrValueType, RelatedBOType, RelatedBAType, BizObjectsType } from './utils/boUtils';
import { findIndirectDeletions, syncCreateAndConnectOppositeBizRels, deleteBizRelations, getChangedRelations, getUpdatedBizAttributes } from './utils/boUtils';

import { MetaRelType } from './../components/composer/page/bizobject/Types';
import { allBOQuery, allMetaRelations, } from '../components/composer/page/bizobject/queries';
import { removeBusinessObjectsFromCache } from '../utils/apolloExtensions';
import { ExecutionResult } from 'react-apollo';
import { RefetchQueryDescription } from 'apollo-client/core/watchQueryOptions';

export const upsertBO = gql`
mutation upsertBO(
    $boid: ID,
    $moid: ID,
    $name: String,
    $state: String,
    $attrs: [BizAttributeCreateWithoutBusinessObjectInput!],
    $rels: [BizRelationCreateWithoutIncomingObjectInput!],
    $delRels: [BizRelationScalarWhereInput!],
    $brValues: [BizAttributeUpdateManyWithWhereNestedInput!]
  ) {
    upsertBusinessObject(
        where: {id: $boid}
        create: {
            metaObject: { connect: { id: $moid}},
            name: $name,
            state: $state,
            bizAttributes: {create: $attrs},
            outgoingRelations: { create: $rels}
        }
        update: {
            state: $state,
            outgoingRelations: { create: $rels, deleteMany: $delRels },
            bizAttributes: {updateMany: $brValues}
        }
    ) {
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

            }
            oppositeRelation {
                id
            }  
        }
    } 
}
`;

const getBO = gql`
query($id: ID) {
    businessObject(
        where: {id: $id}
    ) {
        id
        outgoingRelations {
            id
            oppositeObject {
                id
            }
            oppositeRelation {
                id
            }
            metaRelation {
                id
            }
        }
        bizAttributes {
            id
            metaAttribute {
                id 
            }
            value
        }
        metaObject {
            id
        }
    }
}
`;

const updatePlan = gql`
mutation updatePlan($planId: ID!, $planData: Json, $boId: ID, $itemBOs: [BusinessObjectWhereUniqueInput!]) {
    upsertPlan(
    where: {
        id: $planId
    }
    create: {
		planData: $planData, planBO: {connect: {id: $boId}}, itemBOs: {connect: $itemBOs}
    }
    update: {
		planData: $planData, planBO: {connect: {id: $boId}}, itemBOs: {set: $itemBOs}
    }
    ) {
        id
    }
}
`;
/*
type getBOResponse = {
    id: string
    name: string
    
    outgoingRelations: {
        id: string
        oppositeObject: {
            id: string
        }
    }[]
};

type updateBORelsResponse = {
    updateBusinessObject: {
        outgoingRelations: {
            id: string
        }[]
    }
};
*/
/*
type bizRel = {
    id: string
    oppositeObject: {
        id: string
    }
};

function findDeletedBos(source: bizRel[], compare: {id: string}[]): {id: string}[] {
    var deleted = new Array<{id: string}>(0);
    source.forEach(el => {
        let sourceObj = { id: el.oppositeObject.id }; // Remove field bizRelId from object to compare correctly
        if (compare.findIndex(element => {
            let compObj = { metaRelationId: element.metaRelationId, oppositeObjectId: element.oppositeObjectId }; // Remove field bizRelId from object to compare correctly
            return JSON.stringify(sourceObj) === JSON.stringify(compObj); })
        === -1) {
            deleted.push(el);
        }
    });
    return deleted;
}
*/

export const updateSaveBO =  async (
    bizObjectId: string,            // If === '' --> create, otherwise update
    boName: string,                 // Create only for now RH TODO
    metaObjectId: string,           // Create
    newAttrs: RelatedBAType[],      // Create and update
    newRels: RelatedBOType[],       // Create and update
    saveFinished: () => void,
    refetchQueries: ((result: ExecutionResult) => RefetchQueryDescription) | RefetchQueryDescription
    ) => {
        
    // tslint:disable-next-line:no-console
    console.log('1 Update BO........');
    try {
        let moId = metaObjectId;

        let createAttrs = new Array<{metaAttribute: {connect: {id: string}}, value: string}>();
        let createRels = new Array<ExtendedRelBOType>();
        let deleteRels = new Array<ExtendedRelBOType>();
        var changedAttributeValues = new Array<BizAttrValueType>();

        // Find the added and deleted relations
        
        if (bizObjectId === '') {
            // Fix attributes for save
            newAttrs.map(attr => {
                createAttrs.push({metaAttribute: {connect: {id: attr.maId}}, value: attr.value});
            });
            createRels = newRels;
            changedAttributeValues = [];
        } else {

            let boResult = await client.query({
                query: getBO,
                variables: {id: bizObjectId}
            });
            let bizObject = boResult.data.businessObject;   // To be able to compare find new/deleted relations and changed attribute values
            moId = bizObject.metaObject.id;
        
            changedAttributeValues = getUpdatedBizAttributes(newAttrs, bizObject.bizAttributes);

            const { added, toDelete } = getChangedRelations(bizObject.outgoingRelations, newRels);
            createRels = added;
            deleteRels  = toDelete;
        }

        let result = await client.query({
            query: allMetaRelations,
            variables: {id: moId}
        });
        let allMetaRels = result.data.metaRelations as MetaRelType[];  // To be able to find opposite relation ids

        createRels.forEach(rel => {   // Find opposite meta relation id for when creating opposite relations later on...
            allMetaRels.forEach(mr => {
                if (rel.mrId === mr.id) {
                    rel.oppMRid = mr.oppositeRelation.id;
                    return;
                }
            });            
        });

        // tslint:disable-next-line:no-console
        console.log('Added: ' + JSON.stringify(createRels, null, 2));
        // tslint:disable-next-line:no-console
        console.log('Deleted: ' + JSON.stringify(deleteRels, null, 2));

        // Prepare relations for upsert
        let addedRels = new Array<{metaRelation: {connect: {id: string}}, oppositeObject: {connect: {id: string}}}>();
        createRels.map(item => {
            addedRels.push({metaRelation: {connect: {id: item.mrId}}, oppositeObject: {connect: {id: item.boId}}});
        });

        let delRels = new Array<{id: string}>();
        deleteRels.map(item => {
            delRels.push({id: item.brId});
        });

        // Prepare attributes for upsert
        let inputBrVals = new Array<{where: {id: string}, data: {value: string}}>(); 
        if (changedAttributeValues.length) {
            for (let i = 0; i < changedAttributeValues.length; i++) {
                inputBrVals.push({where: {id: changedAttributeValues[i].brId}, data: {value: changedAttributeValues[i].value}});
            }
        }

        await client.mutate({     // RH TODO, check when this should be executed!!!
            mutation: upsertBO,
            variables: {
                boid: bizObjectId,                          // MySQL, ...?
//                    boid: newObject ? '53cb6b9b4f4ddef1ad47f943' : bizObject.id,    // MongoDB!!
                moid: moId,
                name: boName, 
                state: bizObjectId === '' ? 'Created' : 'Updated',
                attrs: createAttrs,
                rels: addedRels,
                delRels: delRels,
                brValues: inputBrVals
            },
            update: async (cache, mutationResult ) => {
                // tslint:disable-next-line:no-console
                console.log('2 ...Updated BO........ = ', boName);
                // tslint:disable-next-line:no-console
                console.log('Cache: ', cache);

                const resultBO = mutationResult.data.upsertBusinessObject;

                if (bizObjectId === '') {  // Check if new BO
/*                    const data: MOResponse = cache.readQuery({query: MOQuery, variables: {id: moId} });
                    data.metaObject.businessObjects.push(resultBO);  // Will push id
                    cache.writeQuery({ query: MOQuery, variables: {id: moId} , data});
                    
                    const data2: BizObjectsType = cache.readQuery({query: allBOQuery });
                    data2.businessObjects.push(resultBO);
                    cache.writeQuery({ query: allBOQuery, data: data2 });
*/                    
                    removeBusinessObjectsFromCache(cache);
    
                    }
                
                // Prepare for deletion of opposite and indirect relations...
                //      3.1 Prepare ids[] with oppositebrid pairs
                var deleteRelIds = new Array<string>();  // Filter out ids
                deleteRels.map(item => {
                    deleteRelIds.push(item.oppBRid);
                });
                //      3.2. Add, if any, INDIRECT relations to be deleted
                const indirectRels = await findIndirectDeletions(createRels, moId);
                deleteRelIds = deleteRelIds.concat(indirectRels);

                // 5. Create and connect opposite biz relations
                await Promise.all([syncCreateAndConnectOppositeBizRels(resultBO, createRels), deleteBizRelations(deleteRelIds)]);

                // tslint:disable-next-line:no-console
                console.log('Deleted BizRels: **** ', deleteRelIds);

                // Remove deleted BRs from cache
                try {
                    const data3: BizObjectsType = client.readQuery({query: allBOQuery });
                    deleteRelIds.forEach(delBrId => {
                        data3.businessObjects.forEach(bo => {
                            var found = false;
                            bo.outgoingRelations.forEach((br, index) => {
                                if (br.id === delBrId) {
                                    bo.outgoingRelations.splice(index, 1);
                                    found = true;
                                    return;
                                }                    
                            });
                            if (found) { return; }
                        });
                    });
                    client.writeQuery({ query: allBOQuery, data: data3 });
                } catch {
                    // Do nothing - probably landing here when saving BO before query yet in store 'allBOQuery' called from e.g. Composer)
                }

                // tslint:disable-next-line:no-console
                console.log('3 ...BO update klar!');

                saveFinished();

            },
            refetchQueries: refetchQueries
        });
    } catch (e) {
        alert('Error when updating/creating BO:' + e);
    }
    // tslint:disable-next-line:no-console
    console.log('C. Exits updateSaveBO,.....');

};

export function updateBORelations(
    boId: string,
    boName: string,
    relatedObjs: RelatedBOType[],
    saveFinished: () => void,
    refetchQueries: ((result: ExecutionResult) => RefetchQueryDescription) | RefetchQueryDescription,
    planId?: string,
    planData?: { items: {}[], groups: {}[] },
) {
    updateSaveBO(boId, boName, '', [], relatedObjs, saveFinished, refetchQueries);

    // Check if planId != null, update plandata if so...
  
    if (planId !== undefined && planId !== null) {
        var itemBOs = new Array<{id: string}>();  // Filter out Id
        relatedObjs.map(item => {
            itemBOs.push({id: item.boId});
        });

        client.mutate({
            mutation: updatePlan,
            variables: { 
                planId: planId,
                planData: planData,
                boId: boId,
                itemBOs: itemBOs
            },
            // update: // Update cache....
            refetchQueries: refetchQueries
        }).catch(e => {
            alert('Error when saving plan: ' + e);
        });        
    }
}
