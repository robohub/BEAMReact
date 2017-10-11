import * as React from 'react';
import { Field, reduxForm, InjectedFormProps, WrappedFieldProps, GenericField } from 'redux-form';
import { Segment, Form, Dropdown } from 'semantic-ui-react';
import { MOPropertiesType } from '../Types';

interface DropType {
    text: string;
    value: string;
}

export interface MOEditRelsFormData {
    name: string;
    id: string;
    multiplicity: string;
    oneway: boolean;
    correspondingName: string;
}

interface MOEditFormProps {
    metaObjects: MOPropertiesType[];    
}

interface DropDownRelationsProps {
    options: MOPropertiesType[];    
}

const XFieldDropdown = Field as new () => GenericField<DropDownRelationsProps & React.SelectHTMLAttributes<HTMLSelectElement>>;

type MOEditFormInjectedProps = InjectedFormProps<MOEditRelsFormData, MOEditFormProps>;

interface State {
    showOppositeName: boolean;
}

export default 
reduxForm<MOEditRelsFormData, MOEditFormProps>({
    form: 'MOEditRelsForm',
})(
class MOEditRelationsForm extends React.Component<MOEditFormInjectedProps & MOEditFormProps, State> {
    
    state = { showOppositeName: true };
    
    switchOnewWayOnOff = () => {
        this.setState({ showOppositeName: !this.state.showOppositeName});
    }

    render() {
        const { metaObjects } = this.props;
        return (
            <Form onSubmit={this.props.handleSubmit}>
                <Segment.Group>
                    <Segment>
                        <Form.Field>
                            <label>Relation Name</label>
                            <Field
                                name="name"
                                type="text"
                                component="input"
                            />
                        </Form.Field>
                    </Segment>
                    <Segment>
                        <Form.Field>
                            <label>Opposite Object Type</label>
                            <XFieldDropdown
                                name="id"
                                component={MODropdownFormField}
                                multiple={false}
                                options={metaObjects}
                            />
                        </Form.Field>
                    </Segment>
                    <Segment>
                        <Form.Field>
                            <label>Multiplicity</label>
                            <Field name="multiplicity" component="select">
                                <option />
                                <option value="One">One</option>
                                <option value="Many">Many</option>
                            </Field>
                        </Form.Field>
                    </Segment>
                    <Segment>
                        <Form.Field>
                            <label>One-way (directed)</label>
                            <Field
                                name="oneway"
                                id="oneway"
                                component="input"
                                type="checkbox"
                                onChange={this.switchOnewWayOnOff}
                            />
                        </Form.Field>
                    </Segment>
                    {this.state.showOppositeName ?
                        <Segment>
                            <Form.Field>
                                <label>Opposite Relation Name</label>
                                <Field
                                    name="correspondingName"
                                    type="text"
                                    component="input"
                                />
                            </Form.Field>
                        </Segment>
                        :
                        <div/>                        
                    }
                </Segment.Group>
                <Form.Button size="small" color="blue">Add</Form.Button>
            </Form>
        );
    }
});

const MODropdownFormField = (field: (React.SelectHTMLAttributes<HTMLSelectElement> & WrappedFieldProps & DropDownRelationsProps)) => {
    var dropList = new Array<DropType>(0);
    field.options.map((r, index) => {
        dropList.push({text: r.name, value: r.id});
    });
    return (
        <Dropdown
            search={true}
            selection={true}
            value={field.input.value}
            onChange={(param, data) => field.input.onChange(data.value)}
            multiple={field.multiple}
            options={dropList}
        />
    );
};
