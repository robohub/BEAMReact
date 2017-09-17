import * as React from 'react';
import { Field, reduxForm, InjectedFormProps, WrappedFieldProps } from 'redux-form';
import { Button, Segment, Form } from 'semantic-ui-react';

import { FieldArray, WrappedFieldArrayProps } from 'redux-form';
// import validate from './validate';

export interface ContactFormData {
    firstName?: string;
    lastName?: string;
    email?: string;
    RobDropDown?: string;
}
interface FProps {
    label: string;
    type: string;
}

const renderField = ({ input, label, type, meta: { touched, error } }: WrappedFieldProps & FProps) => (
  <div>
    <label>{label}</label>
    <div>
      <input {...input} type={type} placeholder={label} />
      {touched && error && <span>{error}</span>}
    </div>
  </div>
);

class RenderHobbies extends React.Component<WrappedFieldArrayProps<string>> {
    render() {
        const { fields, meta: { error }} = this.props;
        return (
            <div>
                <Button type="button" onClick={() => fields.push('')}>Add Hobby</Button>
                <Segment.Group>         
                    {fields.map((hobby, index) => (
                        <Segment key={index}>
                            <Button
                                primary={true}
                                icon="trash"
                                onClick={() => fields.remove(index)}
                            />
                            <Form.Field>
                                <label>{`Hobby #${index + 1}`}</label>
                                <Field
                                    name={hobby}
                                    type="text"
                                    component={renderField}
                                />
                            </Form.Field>
                        </Segment>
                    ))}
                    {error && <li className="error">{error}</li>}
                </Segment.Group>
            </div>
        );
    }
}

class RenderMembers extends React.Component<WrappedFieldArrayProps<string>> {
    render() {
        const { fields, meta: { dirty, error }} = this.props;
        return (
            <div>
                <Button type="button" onClick={() => fields.push('')}>Add Member</Button>
                {(dirty) && error && <span>{error}</span>}
                <Segment.Group>
                    {fields.map((member, index) => (
                        <Segment key={index}>
                            <Button
                                primary={true}
                                icon="trash"
                                onClick={() => fields.remove(index)}
                            />
                            <h4>Member #{index + 1}</h4>
                            <Form.Field>
                                <label>First Name</label>
                                <Field
                                    name={`${member}.firstName`}
                                    type="text"
                                    component={renderField}
                                />
                            </Form.Field>
                            <Form.Field>
                                <label>Last Name</label>
                                <Field
                                    name={`${member}.lastName`}
                                    type="text"
                                    component={renderField}
                                />
                            </Form.Field>
                            <FieldArray name={`${member}.hobbies`} component={RenderHobbies} />
                        </Segment>
                ))}
                </Segment.Group>
            </div>
        );
    }
}
/*
export interface FieldArraysFormData {
    clubName?: string;
    members?: {
        firstName?: string;
        lastName?: string;
        hobbies?: string[];
    }[];
}
*/
const FieldArraysForm = (props: InjectedFormProps) => {
    const { handleSubmit,  pristine, reset } = props;
    return (
        <Form onSubmit={handleSubmit}>
            <Segment>
                <Form.Field>
                    <label>Club Name</label>
                    <Field
                        name="clubName"
                        type="text"
                        component={renderField}
                    />
                </Form.Field>
                <FieldArray name="members" component={RenderMembers}/>
                <div>
                    <Button type="submit">Submit</Button>
                    <Button type="button" disabled={pristine} onClick={reset}>
                        Clear Values
                    </Button>
                </div>
            </Segment>
        </Form>
    );
};

const FieldArraysFormz = reduxForm({
  form:  'fieldArrays', // a unique identifier for this form
  // validate,
})(FieldArraysForm);

export class ArrayPage extends React.Component {
    
        showResults = (values: ContactFormData) =>
        /*new Promise(resolve => {
            setTimeout(() => {*/
                window.alert(`You submitted:\n\n${JSON.stringify(values, null, 2)}`)
                /*resolve();
            },
                       500);}
        );*/
        render() {
            return (
                <FieldArraysFormz onSubmit={this.showResults}/>
            );
        }
    }

////////////////////////////////////////////////////////////////////////////////////////////////
