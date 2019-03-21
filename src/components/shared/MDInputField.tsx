import * as React from 'react';
import { FieldProps, Field } from 'formik';
import TextField from '@material-ui/core/Input';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from './style';

interface TextFieldProps extends WithStyles<typeof styles> {
    label: string;
}

class MDInputField extends React.Component<FieldProps & TextFieldProps> {

    changeVal(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        this.props.form.setFieldValue(this.props.field.name, event.target.value);
    }

    render() {
        return (
            <TextField
                className={this.props.classes.textField}
                id="boEdit"
                placeholder={this.props.label}
                onChange={newValue => this.changeVal(newValue)}
                {...this.props.field}
            />
        );
    }
}

export default withStyles(styles)((props: FieldProps) => (
    <Field
        {...props}
        component={MDInputField}
    />
));
