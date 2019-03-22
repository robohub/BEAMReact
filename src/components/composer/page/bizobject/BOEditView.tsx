import * as React from 'react';
import { client } from '../../../../index';

import { graphql, ChildProps, compose, MutationFunc, FetchResult } from 'react-apollo';
import gql from 'graphql-tag';
import { allBOQuery, upsertBO, deleteBizRelation, createBizRelation, updateBizAttribute, updateBizObject,
        updateBizRelation, /*findBizRelation, createBRWithoutOpprelation ,*/ updateBRWithOppRel, allMOQuery, MOQuery } from './queries';

import { MOResponse, BOEditType, BizRelationsType, BizAttributeType, FormValues, FormRelation, FormAttribute, BizObjectsType, AllMRResponse } from './Types';

import { BOEditForm } from './BOEditForm';
import { Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

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

type MyProps = {
    newObject: boolean;
    metaobject: MOResponse;
    bizObject?: BOEditType;
    allMetaRels: AllMRResponse;
};

class EditBOView extends React.Component<ChildProps<MyProps & MyMutations>> {
    state = { snackbarOpen: false };
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

        // tslint:disable-next-line:no-console
        console.log('Added: ' + JSON.stringify(createRels, null, 2));
        // tslint:disable-next-line:no-console
        console.log('Deleted: ' + JSON.stringify(deleteRels, null, 2));
    
        await this.updateSaveBO(newObject, bizObject, objName, attrs, createRels, deleteRels);
        // this.deleteBizRelations(deleteRels);
        
        // await Promise.all([this.updateSaveBO(newObject, bizObject, objName, attrs, createRels), this.deleteBizRelations(deleteRels)]);
        
        // tslint:disable-next-line:no-console
        console.log('E. Exits onSAVE,.....');

    }

    deleteBizRelations = async (deleteRelIds: string[]) => {

        // tslint:disable-next-line:no-console
        console.log('Deleted STRING to mutation ' + JSON.stringify(deleteRelIds, null, 2));

        /* try { } catch ... */
        if (deleteRelIds.length > 0) {
            await this.props.delBRPairs({
                variables: {
                    brids: deleteRelIds 
                },
            });
        }
        // tslint:disable-next-line:no-console
        console.log('D. Exits deleteBizRelations,.....');
        return deleteRelIds;
    }

    updateSaveBO =  async (
        newObject: boolean,
        bizObject: BOEditType,
        objName: string,
        attrs: {metaAttribute: {connect: {id: string}}, value: string}[],
        createRels: BizRelPenta[],
        deleteRels: BizRelPenta[] ) => {
            
        // tslint:disable-next-line:no-console
        console.log('1 Update BO........');
        try {

            var addedRels = new Array<{metaRelation: {connect: {id: string}}, oppositeObject: {connect: {id: string}}}>();
            createRels.map(item => {
                addedRels.push({metaRelation: {connect: {id: item.mrid}}, oppositeObject: {connect: {id: item.oppositeObjectId}}});
            });

            var delRels = new Array<{id: string}>();
            deleteRels.map(item => {
                delRels.push({id: item.bizrelId});
            });

            await this.props.upsertBO({     // RH TODO, check when this should be executed!!!
                variables: {
                    boid: newObject ? '' : bizObject.id,                          // MySQL, ...?
//                    boid: newObject ? '53cb6b9b4f4ddef1ad47f943' : bizObject.id,    // MongoDB!!
                    moid: this.props.metaobject.metaObject.id,
                    name: objName, 
                    attrs: attrs,
                    state: 'Created',
                    rels: addedRels,
                    delRels: delRels
                },
                update: async (cache, mutationResult ) => {
                    // tslint:disable-next-line:no-console
                    console.log('2 ...Updated BO........ = ', objName);

                    const resultBO = mutationResult.data.upsertBusinessObject;

                    if (newObject) {
                        const data: MOResponse = cache.readQuery({query: MOQuery, variables: {id: this.props.metaobject.metaObject.id} });
                        data.metaObject.businessObjects.push(resultBO);  // Will push id
                        cache.writeQuery({ query: MOQuery, variables: {id: this.props.metaobject.metaObject.id} , data});
                        
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
                    const indirectRels = this.findIndirectDeletions(createRels);
                    deleteRelIds = deleteRelIds.concat(indirectRels);

                    // 5. Create and connect opposite biz relations
                    await Promise.all([this.syncCreateAndConnectOppositeBizRels(resultBO, createRels), this.deleteBizRelations(deleteRelIds)]);

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

                    this.setState({snackbarOpen: true});
                    
                },
                refetchQueries: [{query: allMOQuery}]
            });
        } catch (e) {
            alert('Error when updating/creating BO:' + e);
        }
        // tslint:disable-next-line:no-console
        console.log('C. Exits updateSaveBO,.....');

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

    findIndirectDeletions = (createRels: BizRelPenta[]): string[] => {
        let indirectRels = new Array<string>();
        createRels.map(added => {
            this.props.metaobject.metaObject.outgoingRelations.forEach(mRel => {
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
    }

    syncCreateAndConnectOppositeBizRels = async (newBO: BOEditType, createRels: BizRelPenta[]) => {
        let singleCreateConnectPromises = new Array<Promise<void>>();

        createRels.map(newRel => {
            newBO.outgoingRelations.forEach(async dbRel => {
                if (dbRel.metaRelation.id === newRel.mrid && dbRel.oppositeObject.id === newRel.oppositeObjectId) {
                    let promise = this.createAndConnectOppositeBizRels(newRel.oppositeObjectId, newBO.id, newRel.oppMRid, dbRel.id);
                    singleCreateConnectPromises.push(promise);
                    return;
                }
            });
        });
        await Promise.all(singleCreateConnectPromises);
        // tslint:disable-next-line:no-console
        console.log('A. Exits syncCreateAndConnectOppositeBizRels, all synced!!!.....');
    }

    createAndConnectOppositeBizRels = async (incboid: string, oppboid: string, mrid: string, oppmrid: string ) => {
        // tslint:disable-next-line:no-any
        let singleCreationPromises = new Array<Promise<void | Record<string, any>>>();

        // tslint:disable-next-line:no-console
        console.log('1 starting BR creation...');
        await this.props.createBR({
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

            let promise = this.props.updateBROppRel({
                variables: {
                    id: oppmrid,
                    oppRelId: response.data.createBizRelation.id,
                },
                update: (cache, result) => {
                    // tslint:disable-next-line:no-console
                    console.log('3... Update for opposite relation ' + result.data.updateBizRelation.id);
                }
            });
            singleCreationPromises.push(promise);
        });
        await Promise.all(singleCreationPromises);
        // tslint:disable-next-line:no-console
        console.log('B. Exits createAndConnectOppositeBizRels, all synced!!!.....');
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

    snackbarClose = () => {
        this.setState({snackbarOpen: false});
    }

    render() {
        // tslint:disable-next-line:no-console
        console.log(' ------ ------  ------ BOEDitView renderar...');

        return (
            <div>
                <BOEditForm
                    newObject={this.props.newObject}
                    onSubmit={this.onSave}
                    // onSubmit={this.showResults}
                    metaObject={this.props.metaobject}
                    bizObject={this.props.newObject ? null : this.props.bizObject}
                />
                <Snackbar
                    anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                    open={this.state.snackbarOpen}
                    autoHideDuration={6000}
                    onClose={this.snackbarClose}
                    ContentProps={{'aria-describedby': 'message-id'}}
                    message={<span id="message-id">Saved Business Object</span>}
                    action={[
                        <IconButton key="close" aria-label="Close" color="inherit" /* className={classes.close} */ onClick={this.snackbarClose}>
                            <CloseIcon/>
                        </IconButton>,
                    ]}
                />               
            </div>
        );
    }
}

interface MyMutations {
    updateBROppRel: MutationFunc<{ updateBizRelation: {id: string; oppositeRelation: {id: string}}}>;
    createBRWithoutOpprel: MutationFunc<{createBizRelation: {id: string}}>;
    updateBR: MutationFunc<{ id: string; }>;
    updateBO: MutationFunc<{ id: string; }>;
    updateBA: MutationFunc<{ id: string; }>;
    createBR: MutationFunc<{ id: string; }>;
    deleteBR: MutationFunc<{ id: string; }>;
    delBRPairs: MutationFunc<{ deleteManyBizRelations: {count: number}}>;
    upsertBO: MutationFunc<UpsertBOResult>;
}

export default compose(
    graphql<{}, MyProps>(updateBRWithOppRel, { name: 'updateBROppRel' }),
//    graphql<{}, MyProps>(createBRWithoutOpprelation, { name: 'createBRWithoutOpprel' }),
    graphql<{}, MyProps>(updateBizRelation, { name: 'updateBR' }),
    graphql<{}, MyProps>(updateBizObject, { name: 'updateBO' }),
    graphql<{}, MyProps>(updateBizAttribute, { name: 'updateBA' }),
    graphql<{}, MyProps>(createBizRelation, { name: 'createBR' }),
    graphql<{}, MyProps>(deleteBizRelation, { name: 'deleteBR' }),
    graphql<{}, MyProps>(deleteBRPairs, { name: 'delBRPairs' }),
    graphql<{}, MyProps>(upsertBO, { name: 'upsertBO'})
)(EditBOView);
