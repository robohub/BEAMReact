import * as React from 'react';
import { Button, Icon, Modal, Tab } from 'semantic-ui-react';
import { EditMORelationsPane } from './../panes/EditMORelationsPane';
import MOEditAttributesForm, { MOEditAttrsFormData } from './../forms/EditMOAttributesForm';
import MOEditRelationsForm, { MOEditRelsFormData } from './../forms/EditMORelationsForm';
import { MOAttributeItemType, MOPropertiesType } from '../Types';

interface Props {
    metaObject: MOPropertiesType;
    metaAttributes: MOAttributeItemType[];
    metaObjects: MOPropertiesType[];
    onSaveAttrs: (moId: string, attrs: string[]) => void;
    onAddRels: (moId: string, newRelation: MOEditRelsFormData) => void;
}
export default class EditAttributesModal extends React.Component<Props> {
    
    private attrsFormInit: MOEditAttrsFormData;
    
    private panes = [
        { 
            menuItem: 'Define Attributes',
            render: () => (
                <Tab.Pane>
                    <MOEditAttributesForm
                        onSubmit={this.onSaveAttrs}
                        metaAttributes={this.props.metaAttributes}
                        initialValues={this.fromMOToAttrsForm()}
                    />
                </Tab.Pane>
            )
        },
        { 
            menuItem: 'Define Relations',
            render: () => (
                <Tab.Pane>
                    <MOEditRelationsForm
                        onSubmit={this.onSaveRelation}
                        metaObjects={this.props.metaObjects}
                    />
                    <EditMORelationsPane outgoingRelations={this.props.metaObject.outgoingRelations}/>
                </Tab.Pane>
            )
        }
    ];
    
    fromMOToAttrsForm = () => {
        let arr = new Array<string>(0);
        this.props.metaObject.attributes.map(a =>
            arr.push(a.id)
        );
        this.attrsFormInit = { attributes: arr };
        return this.attrsFormInit;
    }

    onSaveAttrs = (values: MOEditAttrsFormData) => {
        this.props.onSaveAttrs(this.props.metaObject.id, values.attributes);
    }

    onSaveRelation = (values: MOEditRelsFormData) => {
        this.props.onAddRels(this.props.metaObject.id, values);
    }
    
    // tslint:disable-next-line:no-any
    showResults = (values: any) => {
        // tslint:disable-next-line:no-console
        console.log(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
        window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
    }
    
    /* TODO: Renders one time for each MetaObject - bad? Put as header: mark object to be edited, then trigger modal??? */
    render() {  
        return (     
            <Modal trigger={<Button color="blue"><Icon name="edit"/>Edit</Button>}>  
                <Tab panes={this.panes} />  
            </Modal >          
        );
    }
}