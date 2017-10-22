import * as React from 'react';
import { Field, reduxForm, InjectedFormProps, WrappedFieldProps, GenericField, /*GenericFieldArray, FormSection*/ } from 'redux-form';
import { BOEditType , MOResponse } from './../Types';

import { SelectField, Paper, TextField, Button } from 'react-md';

interface DropType {
    label: string;
    value: string;
}

export interface BOEditFormData {
    // tslint:disable-next-line:no-any
    bizAttributes: any;
    // tslint:disable-next-line:no-any
    bizRelations: any;
}

interface BOEditFormProps {
    newObject: boolean;
    metaObject: MOResponse;
    bizObject?: BOEditType;
}

type BOEditFormInjectedProps = InjectedFormProps<BOEditFormData, BOEditFormProps>;

export default 
reduxForm<BOEditFormData, BOEditFormProps>({
    form: 'BOEditForm', // TODO: sätt namn för varje BO vid runtime --> unik för varje BO i global Store!?
})(
class BOEditForm extends React.Component<BOEditFormInjectedProps & BOEditFormProps> {
    render() {
        const { MetaObject } = this.props.metaObject;
        return (
            <form onSubmit={this.props.handleSubmit}>
                {MetaObject.attributes.length > 0 ?
                    <Paper zDepth={0}>
                        {MetaObject.attributes.map((attr, index) => (
                            <Paper zDepth={0} key={index}>
                                <XTextField
                                    name={'bizAttributes.' + attr.id + '.Value'}
                                    component={renderTextField}
                                    label={attr.name}
                                />
                            </Paper>
                        ))}
                    </Paper>
                    :
                    <div>- No attributes! -</div>
                }
                {MetaObject.outgoingRelations.length > 0 ?
                    <Paper zDepth={0}>
                        {MetaObject.outgoingRelations.map((rel, index) => (
                            <Paper zDepth={0} key={index}>
                                <XFieldDropdown
                                    name={'bizRelations.' + rel.id + '.Value'}
                                    component={BODropdownFormField}
                                    multiple={rel.multiplicity === 'Many'}
                                    options={rel.oppositeObject.businessObjects}
                                    label={rel.oppositeName}
                                />
                            </Paper>
                        ))}
                    </Paper>
                    :
                    <div>- No relations! -</div>
                }
                <Button type="submit" primary={true} raised={true}>Save</Button>
            </form>
        );
    }
});

interface BODropDownProps {
    label: string;
    options: {
        id: string;
        name: string
    }[];
}

const XFieldDropdown = Field as new () => GenericField<BODropDownProps & React.SelectHTMLAttributes<HTMLSelectElement>>;

const BODropdownFormField = (field: (React.SelectHTMLAttributes<HTMLSelectElement> & WrappedFieldProps & BODropDownProps)) => {
    var dropList = new Array<DropType>(0);
    field.options.map((o, index) => {
        dropList.push({label: o.name, value: o.id});
    });
    return (
        <SelectField
            id="moSelect"
            label={field.label}
            value={field.input.value}
            placeholder="Select Type"
            menuItems={dropList}
            onChange={(value, index, event) => field.input.onChange(value)}
            fullWidth={true}
            // position={SelectField.Positions.BOTTOM_RIGHT}
        />
    );
};

interface TextFieldProps {
    label: string;
}

const XTextField = Field as new () => GenericField<TextFieldProps & React.InputHTMLAttributes<HTMLInputElement>>;

const renderTextField = (field: (React.InputHTMLAttributes<HTMLInputElement> & WrappedFieldProps & TextFieldProps)) => {
    return (
        <TextField
            id="boEdit"
            label={field.label}
            placeholder={field.label}
            {...field.input}
            // errorText={touched && error}
        />
    );
};

/*
            // Code snippet for custom FieldArrays...
            <Form onSubmit={this.props.handleSubmit}>
                    {MetaObject.attributes.length > 0 ?
                        <FieldArrayAttrs name="attributes" component={RenderAttributes} attrs={MetaObject.attributes}/>
                        :
                        <div>- No attributes! -</div>
                    }
                    {MetaObject.outgoingRelations.length > 0 ?
                        <FieldArrayRelations name="relations" component={RenderRelations} rels={MetaObject.outgoingRelations}/>
                        :
                        <div>- No relations! -</div>
                    }
                <Form.Button>Save</Form.Button>
            </Form>

interface BORelsProps {
    rels: {
        id: string;
        oppositeName: string;
        oppositeObject: {
            name: string;
            businessObjects: {
                id: string;
                name: string
            }[]
        }
        multiplicity: string
    }[];
}

interface BOFormFieldValue {   // TODO: hur relaterar detta med formData?
    vaxlue: string;
}
interface BOAttrsProps {
    attrs: {
        id: string;
        name: string;
    }[];
}

const FieldArrayAttrs = FieldArray as new () => GenericFieldArray<BOFormFieldValue, BOAttrsProps>;
type FieldArrayAttrsCompProps = BOAttrsProps & WrappedFieldArrayProps<BOFormFieldValue>;

const FieldArrayRelations = FieldArray as new () => GenericFieldArray<BOFormFieldValue, BORelsProps>;
type FieldArrayRelsCompProps = BORelsProps & WrappedFieldArrayProps<BOFormFieldValue>;
*/
/*
class RenderAttributes extends React.Component<FieldArrayAttrsCompProps> {
    render() {
        const { attrs } = this.props;
        return (
            <Segment.Group>
                {attrs.map((attr, index) => (
                    <Segment key={index}>
                        <Form.Field>
                            <label>{attr.name}</label>
                            <Field
                                // name={attr.id}
                                name={'Attributes[' + index + '].Value'}
                                type="text"
                                component="input"
                            />
                        </Form.Field>
                    </Segment>
                ))}
            </Segment.Group>
        );
    }
}
*/
/*
const RenderRelations: React.StatelessComponent<FieldArrayRelsCompProps> = ({ fields, rels }) => {
    return (
        <Segment.Group>
            {rels.map((rel, index) => (
                <Segment key={index}>
                    <Form.Field key={rel.id} >
                        <label>{rel.oppositeName}</label>
                        <XFieldDropdown
                            // name={rel.id}
                            name={'Relations[' + index + '].test.Value'}
                            component={BODropdownFormField}
                            multiple={rel.multiplicity === 'Many'}
                            options={rel.oppositeObject.businessObjects}
                        />
                    </Form.Field>
                </Segment>
            ))}
        </Segment.Group>
    );
};
*/
