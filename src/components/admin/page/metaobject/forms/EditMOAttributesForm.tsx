import * as React from 'react';
import { Field, reduxForm, InjectedFormProps, WrappedFieldProps, GenericField } from 'redux-form';
import { Segment, Form, Dropdown } from 'semantic-ui-react';
import { MOAttributeItemType } from '../Types';

interface DropType {
    text: string;
    value: string;
}

export interface MOEditAttrsFormData {
    attributes: string[];
}

interface MOEditFormProps {
    metaAttributes: MOAttributeItemType[];    
}

interface DropDownProps {
    options: MOAttributeItemType[];    
}

const XFieldDropdown = Field as new () => GenericField<DropDownProps & React.SelectHTMLAttributes<HTMLSelectElement>>;

type MOEditFormInjectedProps = InjectedFormProps<MOEditAttrsFormData, MOEditFormProps>;

export default 
reduxForm<MOEditAttrsFormData, MOEditFormProps>({
    form: 'MOEditAttrsForm',
})(
class MOEditAttributesForm extends React.Component<MOEditFormInjectedProps & MOEditFormProps> {
    render() {
        const { metaAttributes } = this.props;
        return (
            <Form onSubmit={this.props.handleSubmit}>
                <Segment>
                    <Form.Field>
                        <label>{'Attributes'}</label>
                        <XFieldDropdown
                            name="attributes"
                            component={MODropdownFormField}
                            multiple={true}
                            options={metaAttributes}
                        />
                    </Form.Field>
                </Segment>
                <Form.Button size="small" color="blue">Save</Form.Button>
            </Form>
        );
    }
});

const MODropdownFormField = (field: (React.SelectHTMLAttributes<HTMLSelectElement> & WrappedFieldProps & DropDownProps)) => {
    var dropList = new Array<DropType>(0);
    field.options.map((a, index) => {
        dropList.push({text: a.name, value: a.id});
    });
    return (
        <Dropdown
            selection={true}
            value={field.input.value}
            onChange={(param, data) => field.input.onChange(data.value)}
            multiple={field.multiple}
            options={dropList}
        />
    );
};
