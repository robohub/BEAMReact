import * as React from 'react';
import { MOAttributeItemType, MOPropertiesType } from '../Types';
import { MOEditFormData } from '../forms/Types';
import { MOEditForm } from '../MOEditForm';
import { Dialog, DialogTitle } from '@material-ui/core';

type FormValues = MOEditFormData;  // RH temporärt

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from './../../../../shared/style';

interface Props extends WithStyles<typeof styles> {
    metaObject: MOPropertiesType;
    metaAttributes: MOAttributeItemType[];
    metaObjects: MOPropertiesType[];
    onFormSave: (values: FormValues) => void;
    visible: boolean;
    hide: () => void;
}

class EditAttributesModal extends React.Component<Props> {

    onSaveForm = (values: FormValues) => {
        this.props.onFormSave(values);
        // this.showResults(values);
    }
                
    // tslint:disable-next-line:no-any
    showResults = (values: any) => {
        // tslint:disable-next-line:no-console
        console.log(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
        window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
    }
    
    render() {
        
        const { metaObject, metaAttributes, metaObjects, visible, hide, classes } = this.props;

        return (
            <Dialog 
                open={visible}
                onClose={hide}
                fullWidth={true}
                maxWidth={'md'}
            >
                <DialogTitle>
                    {metaObject !== null ? 'Edit: ' + metaObject.name : ''}
                </DialogTitle>
                {metaObject !== null ?
                    <div className={classes.root}>
                        <MOEditForm 
                            onSubmit={this.onSaveForm}
                            metaObject={metaObject}
                            metaAttributes={metaAttributes}
                            metaObjects={metaObjects}
                        />
                    </div>
                    :
                    <div/>
                }
            </Dialog >
        );
    }
}

export default withStyles(styles)(EditAttributesModal);