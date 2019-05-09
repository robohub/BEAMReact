import * as React from 'react';

import { MetaObjectType, FormValues } from './Types';
import { updateSaveBO } from '../../../../domain/businessObject';
import { RelatedBOType, RelatedBAType, BOEditType } from '../../../../domain/utils/boUtils';

import { BOEditForm } from './BOEditForm';
import { Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

type MyProps = {
    newObject: boolean;
    metaobject: MetaObjectType;
    bizObject?: BOEditType;
};

export default class EditBOView extends React.Component<MyProps> {
    state = { snackbarOpen: false };

    onSave = async (values: FormValues) => {
        const { newObject, bizObject } = this.props;
        const { bizAttributes, bizRelations } = values;
        let objName = ''; // RH TODO temporary solution to the naming issue...

        let createBAs = new Array<RelatedBAType>();
        if (this.props.newObject) {
            bizAttributes.map(attr => {
                createBAs.push({maId: attr.maid, value: attr.bizattrval});
                if (attr.name === 'Name') { objName = attr.bizattrval; }
            });
        }
        
        var relatedBOs = new Array<RelatedBOType>();
        bizRelations.map(mo => {
            if (typeof mo.bizrelbizobjs === 'string' && mo.bizrelbizobjs !== '') {
                relatedBOs.push({mrId: mo.metarelid, boId: mo.bizrelbizobjs as string});
            } else {
                for (let e = 0; e < mo.bizrelbizobjs.length; e++) {
                    relatedBOs.push({mrId: mo.metarelid, boId: mo.bizrelbizobjs[e]});
                }
            }
        });

        await updateSaveBO(     // RH TODO, check when this should be executed!!!
            newObject ? '' : bizObject.id,
            objName,
            this.props.metaobject.id,
            createBAs,
            relatedBOs,
            this.saveFinished
        );
        
        // tslint:disable-next-line:no-console
        console.log('E. Exits onSAVE,.....');
    }

    saveFinished = async () => {
        this.setState({snackbarOpen: true});
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
