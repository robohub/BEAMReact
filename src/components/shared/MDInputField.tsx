import * as React from 'react';
import { FieldProps, Field } from 'formik';
import { TextField } from 'react-md';

interface TextFieldProps {
    label: string;
}

class MDInputField extends React.Component<FieldProps & TextFieldProps> {
// const MDInputField: React.SFC<FieldProps & TextFieldProps> = ({field: { onChange, ...field }, label, form: { setFieldValue }}) => {
    
    changeVal(newValue: React.ReactText) {
        this.props.form.setFieldValue(this.props.field.name, newValue);
    }

    render() {
        return (
            <TextField
                id="boEdit"
                label={this.props.label}
                placeholder={this.props.label}
                {...this.props.field}
                onChange={newValue => this.changeVal(newValue)}
            />
        );
    }
}

export default ((props: FieldProps) => (
    <Field
        {...props}
        component={MDInputField}
    />
));
