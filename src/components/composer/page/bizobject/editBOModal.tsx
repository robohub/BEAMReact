import * as React from 'react';
import { Button, /*Icon,*/ Modal } from 'semantic-ui-react';
import BOEditContainer from './BOEditContainer';

type InputProps = {
    selected: boolean;
    metaID: string;
    boType: string;
};

export default class EditBOtModal extends React.Component<InputProps> {
           
        render() {
                    
            const { metaID, selected, boType } = this.props;
                    
            return (     
                <Modal trigger={<Button disabled={!selected}>Create BO</Button>} size="small">
                    <Modal.Header>Add Business Object: {' '} {boType}</Modal.Header>
                    <Modal.Content scrolling={true}>
                        <Modal.Description>
                            {selected ? <BOEditContainer newObject={true} metaID={metaID}/> : '...'}
                        </Modal.Description>
                    </Modal.Content>
                    {/*<Modal.Actions>
                        <Button basic={true} color="red">
                            <Icon name="remove" /> Cancel
                        </Button>
                        <Button color="green">
                            <Icon name="checkmark" /> Save
                        </Button>
                    </Modal.Actions>*/}
                </Modal >
            );
        }
}   
