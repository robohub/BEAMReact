import * as React from 'react';
import { Field, reduxForm, InjectedFormProps, WrappedFieldProps } from 'redux-form';

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
                <button type="button" onClick={() => fields.push('')}>Add Hobby</button>
                <div>         
                    {fields.map((hobby, index) => (
                        <div key={index}>
                            <button
                                onClick={() => fields.remove(index)}
                            />
                                <label>{`Hobby #${index + 1}`}</label>
                                <Field
                                    name={hobby}
                                    type="text"
                                    component={renderField}
                                />
                        </div>
                    ))}
                    {error && <li className="error">{error}</li>}
                </div>
            </div>
        );
    }
}

class RenderMembers extends React.Component<WrappedFieldArrayProps<string>> {
    render() {
        const { fields, meta: { dirty, error }} = this.props;
        return (
            <div>
                <button type="button" onClick={() => fields.push('')}>Add Member</button>
                {(dirty) && error && <span>{error}</span>}
                <div>
                    {fields.map((member, index) => (
                        <div key={index}>
                            <button
                                onClick={() => fields.remove(index)}
                            />
                            <h4>Member #{index + 1}</h4>
                                <label>First Name</label>
                                <Field
                                    name={`${member}.firstName`}
                                    type="text"
                                    component={renderField}
                                />
                                <label>Last Name</label>
                                <Field
                                    name={`${member}.lastName`}
                                    type="text"
                                    component={renderField}
                                />
                            <FieldArray name={`${member}.hobbies`} component={RenderHobbies} />
                        </div>
                ))}
                </div>
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
        <form onSubmit={handleSubmit}>
            <div>
                    <label>Club Name</label>
                    <Field
                        name="clubName"
                        type="text"
                        component={renderField}
                    />
                <FieldArray name="members" component={RenderMembers}/>
                <div>
                    <button type="submit">Submit</button>
                    <button type="button" disabled={pristine} onClick={reset}>
                        Clear Values
                    </button>
                </div>
            </div>
        </form>
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
