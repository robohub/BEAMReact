import * as React from 'react';

import { Tabs, Tab, Button } from '@material-ui/core';

import AttachementIcon from '@material-ui/icons/AttachFile';
import LinkIcon from '@material-ui/icons/Link';

import { MOAttributeItemType, MOPropertiesType } from './Types';

import { withFormik, Form, FormikProps } from 'formik';

import EditMOAttributesForm from './forms/EditMOAttributesForm';
import EditMORelationsForm from './forms/EditMORelationsForm';
import { MOEditFormData } from './forms/Types';

type FormValues = MOEditFormData;

interface Props {
    metaObject: MOPropertiesType;
    metaAttributes: MOAttributeItemType[];
    metaObjects: MOPropertiesType[];
    onSubmit: (values: FormValues) => void;
}

interface CompState {
    tabval: number;
}

const formikEnhancer = withFormik<Props, FormValues>({
    mapPropsToValues: props => {

        return {
            attributes: props.metaObject.attributes,
            relations: props.metaObject.outgoingRelations
        };

    },
    handleSubmit: (values: FormValues, { props, setSubmitting }) => {   // async?  Se fullstack-graphql-airbnb-clone/packages/web/src/modules/register/ui/RegisterView.tsx
        setSubmitting(false);
        props.onSubmit(values);
    },
    displayName: 'Roberts MO Edit Form',
});

class InnerForm extends React.Component<Props & FormikProps<FormValues>, CompState> {

    constructor(props: Props & FormikProps<FormValues>) {
        super(props);
        this.state = { tabval: 0 };
    }

    handleTabChange = (e: React.ChangeEvent, value: number) => {
        this.setState( {tabval: value});
    }

    render() {
        const props = this.props;
        return (
            <Form>
                <div>
                    <Tabs value={this.state.tabval} onChange={this.handleTabChange}>
                        <Tab label="Define Attributes" icon={<AttachementIcon />}/>
                        <Tab label="Define Relations" icon={<LinkIcon />}/>
                    </Tabs>
                    {this.state.tabval === 0 && 
                        <EditMOAttributesForm
                            values={props.values.attributes}
                            metaAttributes={props.metaAttributes}
                        />
                    }
                    {this.state.tabval === 1 && 
                        <EditMORelationsForm
                            values={props.values.relations}
                            metaObjects={props.metaObjects}
                        />
                    }
                </div>
                <Button variant="contained" color="primary" type="submit">Save</Button>
            </Form>
        );
    }
}

export const MOEditForm = formikEnhancer(InnerForm);
