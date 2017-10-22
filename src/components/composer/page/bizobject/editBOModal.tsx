import * as React from 'react';
import BOEditContainer from './BOEditContainer';
import { DialogContainer } from 'react-md';

type InputProps = {
    selected: boolean;
    visible: boolean;
    metaID: string;
    boType: string;
    hide: () => void;
};

export default class EditBOtModal extends React.Component<InputProps> {
           
        render() {
                    
            const { selected, metaID, visible, boType, hide } = this.props;
        
            let actions = [{
                id: 'dialog-cancel',
                secondary: true,
                children: 'Cancel',
                onClick: hide,
            }, {
                id: 'dialog-ok',
                primary: true,
                children: 'Ok',
                onClick: hide,
            }];

            return (
                <DialogContainer
                    id="createBODialog"
                    visible={visible}
                    onHide={hide}
                    actions={actions}
                    title={'Add Business Object: ' + boType}
                    focusOnMount={false}
                    width={480}
                >
                    {selected ? <BOEditContainer newObject={true} metaID={metaID}/> : '...'}

                </DialogContainer >
            );
        }
}   
