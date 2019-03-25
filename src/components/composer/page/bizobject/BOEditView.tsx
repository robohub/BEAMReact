import * as React from 'react';

import { MOResponse, BOEditType, BizRelationsType, BizAttributeType, FormValues, FormRelation, FormAttribute, AllMRResponse } from './Types';
import { updateSaveBO } from '../../../../domain/businessObject';
import { BizRelPenta, UpdateBizAttrPair } from '../../../../domain/utils/boUtils';

import { BOEditForm } from './BOEditForm';
import { Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

type MyProps = {
    newObject: boolean;
    metaobject: MOResponse;
    bizObject?: BOEditType;
    allMetaRels: AllMRResponse;
};

export default class EditBOView extends React.Component<MyProps> {
    state = { snackbarOpen: false };

    onSave = async (values: FormValues) => {

        const { newObject, bizObject } = this.props;
        const { bizAttributes, bizRelations } = values;

        let createAttrs = new Array<{metaAttribute: {connect: {id: string}}, value: string}>();

        let createRels = new Array<BizRelPenta>();
        let deleteRels = new Array<BizRelPenta>();
        var changedAttributeValues = new Array<UpdateBizAttrPair>();

        let objName = ''; // RH TODO temporary solution to the naming issue...

        // Find the added and deleted relations
        
        if (newObject) {
            // Fix attributes for save
            bizAttributes.map(attr => {
                createAttrs.push({metaAttribute: {connect: {id: attr.maid}}, value: attr.bizattrval});
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
            changedAttributeValues = [];
        } else {
            changedAttributeValues = this.getUpdatedBizAttributes(values.bizAttributes, this.props.bizObject.bizAttributes);

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
    
        await updateSaveBO(
            newObject,
            bizObject,
            this.props.metaobject,
            objName,
            createAttrs,
            changedAttributeValues,
            createRels,
            deleteRels,
            this.saveFinished
        );
        
        // tslint:disable-next-line:no-console
        console.log('E. Exits onSAVE,.....');
    }

    saveFinished = async () => {
        this.setState({snackbarOpen: true});  // Will update UI with cach changes as well...
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

    getUpdatedBizAttributes = (newAttrs: FormAttribute[], oldAttrs: BizAttributeType[]): UpdateBizAttrPair[] => {
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
        let changedBizAttrs = new Array<UpdateBizAttrPair>(0);
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
