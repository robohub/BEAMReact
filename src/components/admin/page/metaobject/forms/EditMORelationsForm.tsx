import * as React from 'react';
import { FieldArray, reduxForm, InjectedFormProps, WrappedFieldArrayProps, GenericFieldArray } from 'redux-form';
import { 
    SelectionControlGroup,
    Divider, TextField, SelectField, Button, Grid, Cell, DataTable, TableBody, TableRow, TableColumn, TableHeader
} from 'react-md';
import { MOPropertiesType, MORelationItemType } from '../Types';
import { MOEditFormData } from './Types';

interface RelProps {
    metaObjects: MOPropertiesType[];
}

const XFieldArray = FieldArray as new () => GenericFieldArray<MORelationItemType, RelProps>;

class RenderRelations extends React.Component<WrappedFieldArrayProps<MORelationItemType> & RelProps> {

    state = { showOppositeName: true, selectedBOId: '', selectedBOName: '', relName: '',
              multi: 'One', corrMulti: 'One', corrRelName: '' };
    
    switchOnewWayOnOff = () => {
        this.setState({ showOppositeName: !this.state.showOppositeName});
    }

    render() {
        const { metaObjects, fields } = this.props;
        let multiplicityVals = [{
            label: 'One', value: 'One',
        }, {
            label: 'Many', value: 'Many',
        }];
        
        var dropList = new Array<{label: string, value: string}>(0);
        metaObjects.map((o, index) => {
            dropList.push({label: o.name, value: o.id});
        });

        return (
            <div>
                <Grid>
                    <Cell size={6}>
                        <TextField
                            id="relName"
                            value={this.state.relName}
                            label="Relation Name"
                            onChange={(value, event) => this.setState({relName: value})}
                        />
                    </Cell>
                    <Cell size={6}>
                        <SelectField
                            id="boSelect"
                            label="Related Object Type"
                            value={this.state.selectedBOId}
                            placeholder="Opposite Object Type"
                            menuItems={dropList}
                            onChange={(value, index, event) => {
                                this.setState( {selectedBOId: value, selectedBOName: this.props.metaObjects[index].name});
                            }}
                            fullWidth={true}
                        />
                    </Cell>
                    <Cell size={12}>
                        <SelectionControlGroup
                            id={1}
                            name="sel1"
                            value={this.state.multi}
                            inline={true}
                            labelClassName="md-caption"
                            type="radio"
                            label="Multiplicity"
                            defaultValue="One"
                            controls={multiplicityVals}
                            onChange={(value, event) => this.setState({multi: value})}
                        />
                    </Cell>
                    <Cell size={6} align="top">
                        {this.state.showOppositeName ?
                            <TextField
                                id="corrName"
                                label="Corresponding Relation Name"
                                value={this.state.corrRelName}
                                onChange={(value, event) => this.setState({corrRelName: value})}
                            />
                            :
                            <div/>
                        }                    
                    </Cell>
                    <Cell size={6}>
                        {this.state.showOppositeName ?
                            <SelectionControlGroup
                                id={2}
                                name="sel2"
                                value={this.state.corrMulti}
                                inline={true}
                                labelClassName="md-caption"
                                type="radio"
                                label="Corresponding Multiplicity"
                                defaultValue="One"
                                controls={multiplicityVals}
                                onChange={(value, event) => this.setState({corrMulti: value})}
                            />
                            :
                            <div/>
                        }
                    </Cell>
                    <Cell size={12} align="top">
                        <Button
                            primary={true}
                            raised={true}
                            onClick={() => {
                                let rel = {
                                    oppositeName: this.state.relName,
                                    oppositeObject: { id: this.state.selectedBOId, name: this.state.selectedBOName },
                                    oppositeRelation: {
                                        id: '',
                                        multiplicity: this.state.corrMulti,
                                        oppositeName: this.state.corrRelName
                                    },
                                    multiplicity: this.state.multi,
                                };
                                fields.push(rel);
                            }}
                            disabled={
                                this.state.relName === '' || this.state.selectedBOId === '' || this.state.corrRelName === '' 
                            }
                        >
                            Add Relation
                        </Button>
                    </Cell>
                </Grid>

                <Divider/>
                
                <DataTable plain={true}>
                    <TableHeader>
                        <TableRow>
                            <TableColumn>Name</TableColumn>
                            <TableColumn>Opposite Object</TableColumn>
                            <TableColumn>Multiplicity</TableColumn>
                            <TableColumn>Delete</TableColumn> 
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields.length !== 0 ?
                            fields.map((name, index, r) =>
                                <TableRow key={index}>
                                    <TableColumn>{fields.get(index).oppositeName}</TableColumn>
                                    <TableColumn>{fields.get(index).oppositeObject.name}</TableColumn>
                                    <TableColumn>{fields.get(index).multiplicity}</TableColumn>
                                    <TableColumn>
                                        <Button onClick={() => fields.remove(index)} icon={true} primary={true} secondary={true}>delete_forever</Button>
                                    </TableColumn>
                                </TableRow>                            
                            )
                            :
                            <TableRow>
                                <TableColumn>
                                    No relations defined...
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
    metaObjects: MOPropertiesType[];    
}

type MOEditFormInjectedProps = InjectedFormProps<MOEditFormData, MOEditFormProps>;

interface State {
    showOppositeName: boolean;
}

export default 
reduxForm<MOEditFormData, MOEditFormProps>({
    form: 'MOEditForm',
})(
class MOEditRelationsForm extends React.Component<MOEditFormInjectedProps & MOEditFormProps, State> {

    render() {
        const { metaObjects } = this.props;
        return (
            <form onSubmit={this.props.handleSubmit}>
                <XFieldArray
                    name="relations"
                    component={RenderRelations}
                    metaObjects={metaObjects}
                />
            </form>
                
        );
    }
});
