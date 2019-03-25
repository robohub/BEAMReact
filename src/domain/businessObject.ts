import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import { FetchResult } from 'react-apollo';

import { client } from '../index';

import { BizRelPenta, findIndirectDeletions, UpdateBizAttrPair, syncCreateAndConnectOppositeBizRels, deleteBizRelations } from './utils/boUtils';
import { MOResponse, BOEditType, BizObjectsType } from './../components/composer/page/bizobject/Types';
import { allBOQuery, upsertBO, allMOQuery, MOQuery, } from '../components/composer/page/bizobject/queries';

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
        }
    }
}
`;

const updateBizRels = gql`
mutation updateBoRels($boid: ID, $rels: [BizRelationCreateWithoutIncomingObjectInput!]) {
    updateBusinessObject(
        where: {id: $boid}
        data: {
            outgoingRelations: { create: $rels }
        }
    ) {
        id
        outgoingRelations {
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

type getBOResponse = {
    id: string
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
export function updateBORelations(
    id: string,
    relatedObjs: {id: string, mrid: string}[],
    planId?: string,
    planData?: { items: {}[], groups: {}[] }
) {
    client.query({
        query: getBO,
        variables: {id: id}
    }).then(async (response: ApolloQueryResult<getBOResponse>) => {
        
        // 1. Create new relations
        
        var relations = new Array<{metaRelation: {connect: {id: string}}, oppositeObject: {connect: {id: string}}}>();
        relatedObjs.map((item: {id: string, mrid: string}) => {
            relations.push({metaRelation: {connect: {id: item.mrid}}, oppositeObject: {connect: {id: item.id}}});
        });

        await client.mutate({
            mutation: updateBizRels,
            variables: { 
                boid: id,
                rels: relations
            },
        }).then(async (resp: FetchResult<updateBORelsResponse>) => {
            // tslint:disable-next-line:no-console
            console.log('Respons från update bizrels' + resp.data.updateBusinessObject.outgoingRelations);
        }).catch(e => {
            alert('Error when updating biz relations: ' + e);
        });        

        // 2. Check if planId != null, update plandata if so...
        
        if (planId !== undefined && planId !== null) {
            var itemBOs = new Array<{id: string}>();  // Filter out Id
            relatedObjs.map((item: {id: string}) => {
                itemBOs.push({id: item.id});
            });

            client.mutate({
                mutation: updatePlan,
                // fetchPolicy: 'network-only',
                variables: { 
                    planId: planId,
                    planData: planData,
                    boId: id,
                    itemBOs: itemBOs
                }
            }).catch(e => {
                alert('Error when saving plan: ' + e);
            });        
        }
    }).catch (e =>
        alert('Error in function updateBORelations: ' + e)
    );
}

export const updateSaveBO =  async (
    newObject: boolean,
    bizObject: BOEditType,
    metaobject: MOResponse,
    objName: string,
    attrs: {metaAttribute: {connect: {id: string}}, value: string}[],
    changedAttributeValues: UpdateBizAttrPair[],
    createRels: BizRelPenta[],
    deleteRels: BizRelPenta[],
    saveFinished: () => void ) => {
        
    // tslint:disable-next-line:no-console
    console.log('1 Update BO........');
    try {
        // Prepare relations for upsert
        let addedRels = new Array<{metaRelation: {connect: {id: string}}, oppositeObject: {connect: {id: string}}}>();
        createRels.map(item => {
            addedRels.push({metaRelation: {connect: {id: item.mrid}}, oppositeObject: {connect: {id: item.oppositeObjectId}}});
        });

        let delRels = new Array<{id: string}>();
        deleteRels.map(item => {
            delRels.push({id: item.bizrelId});
        });

        // Prepare attributes for upsert
        let inputBrVals = new Array<{where: {id: string}, data: {value: string}}>(); 
        if (changedAttributeValues.length) {
            for (let i = 0; i < changedAttributeValues.length; i++) {
                inputBrVals.push({where: {id: changedAttributeValues[i].bizRelId}, data: {value: changedAttributeValues[i].value}});
            }
        }

        await client.mutate({     // RH TODO, check when this should be executed!!!
            mutation: upsertBO,
            variables: {
                boid: newObject ? '' : bizObject.id,                          // MySQL, ...?
//                    boid: newObject ? '53cb6b9b4f4ddef1ad47f943' : bizObject.id,    // MongoDB!!
                moid: metaobject.metaObject.id,
                name: objName, 
                attrs: attrs,
                state: 'Created',
                rels: addedRels,
                delRels: delRels,
                brValues: inputBrVals
            },
            update: async (cache, mutationResult ) => {
                // tslint:disable-next-line:no-console
                console.log('2 ...Updated BO........ = ', objName);

                const resultBO = mutationResult.data.upsertBusinessObject;

                if (newObject) {
                    const data: MOResponse = cache.readQuery({query: MOQuery, variables: {id: metaobject.metaObject.id} });
                    data.metaObject.businessObjects.push(resultBO);  // Will push id
                    cache.writeQuery({ query: MOQuery, variables: {id: metaobject.metaObject.id} , data});
                    
                    const data2: BizObjectsType = client.readQuery({query: allBOQuery });
                    data2.businessObjects.push(resultBO);
                    client.writeQuery({ query: allBOQuery, data: data2 });
                }
                
                // Prepare for deletion of opposite and indirect relations...
                //      3.1 Prepare ids[] with oppositebrid pairs
                var deleteRelIds = new Array<string>();  // Filter out ids
                deleteRels.map(item => {
                    deleteRelIds.push(item.oppBRid);
                });
                //      3.2. Add, if any, INDIRECT relations to be deleted
                const indirectRels = findIndirectDeletions(createRels, metaobject);
                deleteRelIds = deleteRelIds.concat(indirectRels);

                // 5. Create and connect opposite biz relations
                await Promise.all([syncCreateAndConnectOppositeBizRels(resultBO, createRels), deleteBizRelations(deleteRelIds)]);

                // tslint:disable-next-line:no-console
                console.log('Deleted BizRels: **** ', deleteRelIds);

                // Remove deleted BRs from cache
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

                // tslint:disable-next-line:no-console
                console.log('3 ...BO update klar!');

                saveFinished();
                
            },
            refetchQueries: [{query: allMOQuery}]
        });
    } catch (e) {
        alert('Error when updating/creating BO:' + e);
    }
    // tslint:disable-next-line:no-console
    console.log('C. Exits updateSaveBO,.....');
};
