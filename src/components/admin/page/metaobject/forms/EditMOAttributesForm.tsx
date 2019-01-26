import * as React from 'react';
import { FieldArray, reduxForm, InjectedFormProps, WrappedFieldArrayProps, GenericFieldArray } from 'redux-form';
import { FontIcon, Divider, SelectField, Button, Grid, Cell, DataTable, TableBody, TableRow, TableColumn, TableHeader } from 'react-md';
import { MOAttributeItemType } from '../Types';
import { MOEditFormData } from './Types';

interface AttrProps {
    metaAttributes: MOAttributeItemType[];
}

class RenderAttributes extends React.Component<WrappedFieldArrayProps<MOAttributeItemType> & AttrProps> {

    state = { selectedMOId: '', selectedMOIndex: 0};

    render() {
        const { metaAttributes, fields } = this.props;
        
        var dropList = new Array<{label: string, value: string}>(0);
        metaAttributes.map((a, index) => {
            dropList.push({label: a.name, value: a.id});
        });

        return (
            <div /*style={{borderStyle: 'solid', borderWidth: 'thin', borderColor: 'lightgray', borderSpacing: '5px'}}*/>
                <Grid >
                    <Cell size={6} >
                        <SelectField
                            id="moSelect"
                            label="Select Attribute"
                            value={this.state.selectedMOId}
                            placeholder="Select Attribute"
                            menuItems={dropList}
                            onChange={(value, index, event) => {
                                this.setState( {selectedMOId: value, selectedMOIndex: index});
                            }}
                            fullWidth={true}
                        />
                    </Cell>
                    <Cell size={6} align="bottom">
                        <Button
                            primary={true}
                            raised={true}
                            onClick={() =>
                                fields.push(metaAttributes[this.state.selectedMOIndex])
                            }
                            disabled={this.state.selectedMOId === ''}
                        >
                            Add Attribute
                        </Button>
                    </Cell>
                </Grid>
                <Divider/>
                <DataTable plain={true}>
                    <TableHeader>
                        <TableRow>
                            <TableColumn>Name</TableColumn>
                            <TableColumn>Type</TableColumn>
                            <TableColumn>Action</TableColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.length !== 0 ?
                            fields.map((name, index, attr) =>
                                <TableRow key={index}>
                                    <TableColumn>
                                        {fields.get(index).name}
                                    </TableColumn>
                                    <TableColumn>
                                        {fields.get(index).type}
                                    </TableColumn>
                                    <TableColumn>
                                        <Button size="small" onClick={() => fields.remove(index)} secondary={true} flat={true} iconEl={<FontIcon>delete_forever</FontIcon>}>
                                            Delete
                                        </Button>
                                    </TableColumn>
                                </TableRow>
                            )
                            :
                            <TableRow>
                                <TableColumn>
                                    No attributes defined...
                                </TableColumn>
                            </TableRow>

                        }
                    </TableBody>
                </DataTable>
            </div>
        );
    }
}

interface MOEditFormProps {
    metaAttributes: MOAttributeItemType[];    
}

const XFieldArray = FieldArray as new () => GenericFieldArray<MOAttributeItemType, AttrProps>;

type MOEditFormInjectedProps = InjectedFormProps<MOEditFormData, MOEditFormProps>;

export default 
reduxForm<MOEditFormData, MOEditFormProps>({
    form: 'MOEditForm',
})(
class MOEditAttributesForm extends React.Component<MOEditFormInjectedProps & MOEditFormProps> {

    render() {
        const { metaAttributes } = this.props;
        return (
            <form onSubmit={this.props.handleSubmit}>
                <XFieldArray
                    name="attributes"
                    component={RenderAttributes}
                    metaAttributes={metaAttributes}
                />
            </form>
        );
    }
});
