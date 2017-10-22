import * as React from 'react';
import { DialogContainer, TabsContainer, Tab, Tabs } from 'react-md';
// import { EditMORelationsPane } from './../panes/EditMORelationsPane';
import MOEditAttributesForm /*, { MOEditAttrsFormData } */ from './../forms/EditMOAttributesForm';
import MOEditRelationsForm /*, { MOEditRelsFormData }*/ from './../forms/EditMORelationsForm';
import { MOAttributeItemType, MOPropertiesType } from '../Types';
import { MOEditFormData } from '../forms/Types';
import { connect, DispatchProp } from 'react-redux';
import { submit } from 'redux-form';

interface Props {
    metaObject: MOPropertiesType;
    metaAttributes: MOAttributeItemType[];
    metaObjects: MOPropertiesType[];
    onFormSave: (moId: string, newRelation: MOEditFormData) => void;
    visible: boolean;
    hide: () => void;
}
class EditAttributesModal extends React.Component<Props & DispatchProp<{}>> {
    
    private formInit: MOEditFormData;

    initForm = () => {
        this.formInit = {
            attributes: this.props.metaObject.attributes,
            relations: this.props.metaObject.outgoingRelations
        };
    }

    onSaveForm = (values: MOEditFormData) => {
        this.props.onFormSave(this.props.metaObject.id, values);
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

        let actions = [{
            id: 'dialog-cancel',
            secondary: true,
            children: 'Cancel',
            onClick: hide,
        }, {
            id: 'dialog-ok',
            primary: true,
            children: 'Save',
            onClick: () => this.props.dispatch(submit('MOEditForm'))   // Modal 'save' remote submits MOEditForm!
        }];

        if (metaObject !== null ) { this.initForm(); }

        return (
            <DialogContainer
                id="EditMODialog"
                title={metaObject !== null ? 'Edit: ' + metaObject.name : ''}
                visible={visible}
                onHide={hide}
                actions={actions}
                focusOnMount={false}
                width={720}
            >
            {
                metaObject !== null ?
                    <TabsContainer panelClassName="md-grid" colored={true}>
                        <Tabs tabId="simple-tab">
                            <Tab label="Define Attributes">
                                <MOEditAttributesForm
                                    onSubmit={this.onSaveForm}
                                    metaAttributes={metaAttributes}
                                    initialValues={this.formInit}
                                />
                            </Tab>
                            <Tab label="Define Relations">
                                <MOEditRelationsForm
                                    onSubmit={this.onSaveForm}
                                    metaObjects={metaObjects}
                                    initialValues={this.formInit}
                                />
                            </Tab>
                        </Tabs>
                    </TabsContainer>
                    :
                    <div/>

            }
            </DialogContainer>
        );
    }
}

export default connect()(EditAttributesModal);