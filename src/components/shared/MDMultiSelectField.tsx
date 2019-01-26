import * as React from 'react';
import { FieldProps, Field } from 'formik';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Chip from '@material-ui/core/Chip';

interface SelectFieldProps {
    label: string;
    options: {
        id: string;
        name: string
    }[];
}

// const MDSelectField: React.SFC<FieldProps & SelectFieldProps> = ({field: { /* onChange*/ ...field }, options, label, form: { setFieldValue }}) => {

class MDMultiSelectField extends React.Component<FieldProps & SelectFieldProps> {
    // const MDInputField: React.SFC<FieldProps & TextFieldProps> = ({field: { onChange, ...field }, label, form: { setFieldValue }}) => {

    getNameFromId = ((val: string) => {
        var name = '';
        for (let i = 0; i < this.props.options.length; i++) {
            if (this.props.options[i].id === val) {
                name = this.props.options[i].name;
                break;
            }
        }
        return name;
    });

    changeVal(event: React.ChangeEvent<HTMLSelectElement>) {
        this.props.form.setFieldValue(this.props.field.name, event.target.value);
    }

    render() {
        return (
            <FormControl>
                <InputLabel htmlFor="select-multiple-chip">{this.props.label}</InputLabel>
                <Select
                    multiple={true}
                    value={this.props.field.value}
                    onChange={newValue => this.changeVal(newValue)}
                    input={<Input id="select-multiple-chip" />}
                    renderValue={(selected: []) => (
                        // <div className={classes.chips}>
                        <div>
                            {selected.map(value => (
                                // <Chip key={value} label={value} className={classes.chip} />
                                <Chip key={value} label={this.getNameFromId(value)} />
                            ))}
                        </div>
                    )}
                >
                    {this.props.options.map(opt => (
                        <MenuItem key={opt.id} value={opt.id}>
                            {opt.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }
}

export default ((props: SelectFieldProps) => (
    <Field
        {...props}
        component={MDMultiSelectField}
    />
));
