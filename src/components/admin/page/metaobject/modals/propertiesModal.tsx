import * as React from 'react';
import { DialogContainer } from 'react-md';
import { MOAttributeItemType, MOPropertiesType } from '../Types';
import { MOEditFormData } from '../forms/Types';
import { MOEditForm } from '../MOEditForm';

type FormValues = MOEditFormData;  // RH temporärt

interface Props {
    metaObject: MOPropertiesType;
    metaAttributes: MOAttributeItemType[];
    metaObjects: MOPropertiesType[];
    onFormSave: (values: FormValues) => void;
    visible: boolean;
    hide: () => void;
}

export default class EditAttributesModal extends React.Component<Props> {

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
        
        const { metaObject, metaAttributes, metaObjects, visible, hide } = this.props;

        return (
            <DialogContainer
                id="EditMODialog"
                title={metaObject !== null ? 'Edit: ' + metaObject.name : ''}
                visible={visible}
                onHide={hide}
                focusOnMount={false}
                width={720}
            >
            {
                metaObject !== null ?
                    <MOEditForm
                        onSubmit={this.onSaveForm}
                        metaObject={metaObject}
                        metaAttributes={metaAttributes}
                        metaObjects={metaObjects}
                    />
                    :
                    <div/>

            }
            </DialogContainer>
        );
    }
}
