import * as React from 'react';
import { FieldProps, Field } from 'formik';
import { Select, FormControl, InputLabel, Input, MenuItem } from '@material-ui/core';

import { WithStyles, withStyles } from '@material-ui/core/styles';
import { styles } from './style';

interface DropType {
    label: string;
    value: string;
}

interface SelectFieldProps extends WithStyles<typeof styles> {
    label: string;
    options: {
        id: string;
        name: string
    }[];
}

class MDSelectField extends React.Component<FieldProps & SelectFieldProps> {

    private dropList = new Array<DropType>(0);

    constructor(props: FieldProps & SelectFieldProps) {
        super(props);
        props.options.map(o => {
            this.dropList.push({label: o.name, value: o.id});
        });
    }

    changeVal(value: string) {
        this.props.form.setFieldValue(this.props.field.name, value);
    }
    
    render() {
        return (
            <FormControl className={this.props.classes.button}>  {/* RH TODO: coordinate styles with better context driven names! */}
                <InputLabel htmlFor="input" className={this.props.classes.select}>
                    {this.props.label}
                </InputLabel>
                <Select 
                    className={this.props.classes.select}
                    value={this.props.field.value}
                    onChange={ev => this.changeVal(ev.target.value as string)}
                    input={<Input name="moSelect" id="input"/>}
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

export default withStyles(styles)((props: SelectFieldProps) => (
    <Field
        {...props}
        component={MDSelectField}
    />
));
