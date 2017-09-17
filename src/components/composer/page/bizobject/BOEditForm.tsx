import * as React from 'react';
import { Field, reduxForm, InjectedFormProps, WrappedFieldProps, GenericField, GenericFieldArray, /*FormSection*/ } from 'redux-form';
import { Segment, Form, Dropdown } from 'semantic-ui-react';
import { FieldArray, WrappedFieldArrayProps } from 'redux-form';
import { BOEditType , MOResponse } from './../Types';

interface DropType {
    text: string;
    value: string;
}

export interface BOEditFormData {
    'Attributes': {
        'key': string;
        'Value': string;
    }[];
    'Relations': {
        'key': string;
        'Value': string | string[];
    }[];
}

interface BOEditFormProps {
    newObject: boolean;
    metaObject: MOResponse;
    bizObject?: BOEditType;
}
interface BODropDownProps {
    options: {
        id: string;
        name: string
    }[];
}
const XFieldDropdown = Field as new () => GenericField<BODropDownProps & React.SelectHTMLAttributes<HTMLSelectElement>>;
type BOEditFormInjectedProps = InjectedFormProps<BOEditFormData, BOEditFormProps>;

interface BOFormFieldValue {   // TODO: hur relaterar detta med formData?
    vaxlue: string;
}
interface BOAttrsProps {
    attrs: {
        id: string;
        name: string;
    }[];
}
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
const FieldArrayAttrs = FieldArray as new () => GenericFieldArray<BOFormFieldValue, BOAttrsProps>;
type FieldArrayAttrsCompProps = BOAttrsProps & WrappedFieldArrayProps<BOFormFieldValue>;

const FieldArrayRelations = FieldArray as new () => GenericFieldArray<BOFormFieldValue, BORelsProps>;
type FieldArrayRelsCompProps = BORelsProps & WrappedFieldArrayProps<BOFormFieldValue>;

export default 
reduxForm<BOEditFormData, BOEditFormProps>({
    form: 'BOEditForm', // TODO: sätt namn för varje BO vid runtime --> unik för varje BO i global Store!?
})(
class BOEditForm extends React.Component<BOEditFormInjectedProps & BOEditFormProps> {
    render() {
        const { MetaObject } = this.props.metaObject;
        return (
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
        );
    }
});

class RenderAttributes extends React.Component<FieldArrayAttrsCompProps> {
    render() {
        const { /*fields,*/ attrs } = this.props;
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

const RenderRelations: React.StatelessComponent<FieldArrayRelsCompProps> = ({ fields, rels }) => {
    return (
        <Segment.Group>
            {rels.map((rel, index) => (
                <Segment key={index}>
                <Form.Field key={rel.id} >
                    <label>{rel.oppositeName}</label>
                    <XFieldDropdown
                        // name={rel.id}
                        name={'Relations[' + index + '].Value'}
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

const BODropdownFormField = (field: (React.SelectHTMLAttributes<HTMLSelectElement> & WrappedFieldProps & BODropDownProps)) => {
    var dropList = new Array<DropType>(0);
    field.options.map(o => {
        dropList.push({text: o.name, value: o.id});
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
