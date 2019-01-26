import * as React from 'react';
import { FieldProps, Field } from 'formik';
import { SelectField } from 'react-md';

interface DropType {
    label: string;
    value: string;
}

interface SelectFieldProps {
    label: string;
    options: {
        id: string;
        name: string
    }[];
}

// const MDSelectField: React.SFC<FieldProps & SelectFieldProps> = ({field: { /* onChange*/ ...field }, options, label, form: { setFieldValue }}) => {

class MDSelectField extends React.Component<FieldProps & SelectFieldProps> {
    // const MDInputField: React.SFC<FieldProps & TextFieldProps> = ({field: { onChange, ...field }, label, form: { setFieldValue }}) => {

    private dropList = new Array<DropType>(0);

    constructor(props: FieldProps & SelectFieldProps) {
        super(props);
        props.options.map(o => {
            this.dropList.push({label: o.name, value: o.id});
        });
    }

    changeVal(newValue: React.ReactText) {
        this.props.form.setFieldValue(this.props.field.name, newValue);
    }
    
    render() {
        return (
            <SelectField
                id="moSelect"
                label={this.props.label}
                value={this.props.field.value}
                placeholder="Select Type"
                menuItems={this.dropList}
                onChange={newValue => this.changeVal(newValue)}
                fullWidth={true}
                // defaultValue="ROB"
            />
        );
    }
}

export default ((props: SelectFieldProps) => (
    <Field
        {...props}
        component={MDSelectField}
    />
));
