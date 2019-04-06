import * as React from 'react';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { Grid, WithStyles, withStyles, Paper } from '@material-ui/core';

import { styles } from '../shared/style';
import { GridSize } from '@material-ui/core/Grid';

import TimeLine from '../planner/pages/components/timeLine';
import BOGraphContainer from '../navigation/navComponents/boGraphContainer';

// Login specified application variables
export class LoginVars {
    public static USER_ID = ''; // Set when user logs in, equals unique user name, eg. CDSID for VCC
    public static DEFAULT_USER_TEMPLATE = 'cjtr7o7z5guht0b75ioan02dr'; // Read at logon from TemplateConfig (system setup config)
    public static USER_TEMPLATE_NAME = ''; // The template associated with the logged on user
    public static USER_TEMPLATE_ID = ''; // The template associated with the logged on user
    public static USER_TEMPLATE_MAP = new Map<string, {id: string, name: string}>();
}

class DefaultTemplate extends React.Component {
    render() {  
        return (
            <div>
                DefaultTemplate
            </div>
        );
    }
}

export const getTemplateMapping = gql`
query getTemplateMapping{
    templateMappings{
        id
        template { id name }
        businessObject { id }
    }
}
`;

export type MappingType = {
    template: { id: string, name: string }
    businessObject: { id: string }
};

export const getUserRelations = gql`
query getUserRelations($moId: ID, $userId: String, $mrId: ID) {
    businessObjects(
        where: {
            AND: [{metaObject: {id: $moId}},
                {name: $userId},{outgoingRelations_some: {metaRelation: {id:$mrId}}}]
        }
    )
    {
        id
        outgoingRelations {
            id
            metaRelation { id }
            oppositeObject { id  }
        }
    }
}
`;

export type UserRelationType = {
    outgoingRelations: {
        metaRelation: {
            id: string
        }
        oppositeObject: { id: string }
    }[]
};

const getTemplate = gql`
query getTemplate($tid:ID){
    template(
        where: {id: $tid}
    ) {
        id
        name
        widgets {
            id
            name
            type
            width
            boid
            text
        }
    }
}
`;

type WidgetType = {
    id: string;
    name: string;
    type: string;
    width: GridSize;
    boid: string;
    text: string;
};

type TemplateType = {
    widgets: WidgetType[];
};

interface WidgetProps  {
    render: WidgetType;
}

class Widget extends React.Component<WidgetProps> {

    updateSelectedBO = (boId: string) => {
        // This is just temporary - until TimeLine/Navigation is split to read-only component!
    }

    componentWillUpdate() {
        // tslint:disable-next-line:no-console
        console.log('WIDGET will update...');
    }    

    render() {
        // tslint:disable-next-line:no-console
        console.log('-- RENDER WIDGET ...');

        const { render } = this.props;
        switch (render.type) {
            case 'Plan':
                return (
                    <TimeLine
                        selectedBO={render.boid}
                        updateSelectedBO={this.updateSelectedBO}
                        selectedBoName={render.name}
                    />
                    // 'TIMELINE WIDGET'
                );
            case 'Navigation':
                return (
                    <BOGraphContainer
                        selectedBO={render.boid}
                        updateInfoView={this.updateSelectedBO}
                    />
                    // 'NAVIGATION WIDGET'
                );
            case 'Text':
                return render.text;

            default:
                return <span> -Widget Type not implemented-</span>;
            }       
    }
}  

interface UserProps {
    templateName: string;
    templateId: string;
}

class UserBasedTemplate extends React.PureComponent<UserProps> {

    componentWillUpdate() {
        // tslint:disable-next-line:no-console
        console.log('UserBasedTemplate will update...');
    }

    componentDidUpdate() {
        // tslint:disable-next-line:no-console
        console.log('UserBasedTemplate was UPDATED...');
    }

    render() {

        // tslint:disable-next-line:no-console
        console.log('-- RENDER UserBasedTemplate ...');

        return (
/*            <Query query={getTemplateMapping}> 
                {({ loading, data: { templateMappings }, error }) => {
                    if (loading) {
                        return <div>Loading</div>;
                    }
                    if (error) {
                        return <h1>ERROR</h1>;
                    }
                    // tslint:disable-next-line:no-console
                    console.log('-- QUERY 1 ...');    // TODO RH: Denna Query ska ha gjorts t.ex. vid inloggning!?

                    let userTemplateMap = new Map<string, {id: string, name: string}>();
                    templateMappings.forEach((mapping: MappingType) => {
                        userTemplateMap.set(mapping.businessObject.id, {id: mapping.template.id, name: mapping.template.name});
                    });
                    
                    return (*/
                        // TODO RH: Denna Query ska ha gjorts t.ex. vid inloggning!?
/*                        <Query
                            query={getUserRelations}
                            variables={{
                                moId: this.props.mappedUserMO,
                                userId: this.props.userid,
                                mrId: this.props.userTemplateMR
                            }}
                        > 
                            {({ loading: loading2, data: data2, error: error2 }) => {
                                if (loading2) {
                                    return <div>Loading</div>;
                                }
                                if (error2) {
                                    return <h1>ERROR</h1>;
                                }

                                // tslint:disable-next-line:no-console
                                console.log('-- QUERY 22 ...' + this.props.mappedUserMO + ' ' + this.props.userid + ' ' + this.props.userTemplateMR);

                                let templateId = DEFAULT_USER_TEMPLATE;
                                let templateName = 'Default template';    // Read from DB

                                const businessObjects = data2.businessObjects as UserRelationType[];

                                // tslint:disable-next-line:no-console
                                console.log('Response: ' + businessObjects);

                                if (businessObjects.length) {  // Check if userid is connected to BO via relation defined by TEMPLATE_CONFIG_MORELATION
                                    businessObjects[0].outgoingRelations.forEach(rel => {
                                        if (rel.metaRelation.id === this.props.userTemplateMR) {
                                            const template = userTemplateMap.get(rel.oppositeObject.id);
                                            if (template !== undefined) {  // Check if the BO is mapped to template
                                                templateId = template.id;
                                                templateName = template.name;
                                                return;
                                            }
                                        }
                                    });
                                }

                                return (*/
                                    <Grid container={true}>

                                        <Grid item={true} xs={12}>
                                            User Template: {' ' + this.props.templateName}
                                        </Grid>
                                        <Query
                                            query={getTemplate}
                                            variables={{
                                                tid: this.props.templateId
                                            }}
                                        > 
                                            {({ loading: loading3, data: data3, error: error3 }) => {
                                                if (loading3) {
                                                    return <div>Loading</div>;
                                                }
                                                if (error3) {
                                                    return <h1>ERROR</h1>;
                                                }

                                                // tslint:disable-next-line:no-console
                                                console.log('-- QUERY 333 ...');
                                
                                                const template = data3.template as TemplateType;

                                                return (
                                                    template.widgets.length ? (
                                                        template.widgets.map((widget, index) => {
                                                            return (
                                                                <Grid item={true} xs={widget.width} key={index}>
                                                                    <Paper>
                                                                        <Widget render={widget}/>
                                                                    </Paper>
                                                                </Grid>
                                                            );
                                                        }))
                                                        :
                                                        '-No widgets defined for this template-'
                                                );
                                            }}
                                        </Query>
                                    </Grid>
/*                                );
                            }}
                        </Query>*/
//                    );
//                }}
//            </Query>
        );
    }
}

interface Props extends WithStyles<typeof styles> {
}

class HomePage extends React.Component<Props> {

    componentWillUpdate() {
        // tslint:disable-next-line:no-console
        console.log('HOMEPAGE will update...');
    }

    render() {

        // tslint:disable-next-line:no-console
        console.log('-- RENDER HOMEPAGE ...');
        if (LoginVars.USER_ID === '') {
            return '-NOT LOGGED IN-';
        }
        const { classes } = this.props;

        return (
            <Grid container={true} className={classes.root}>
                <Grid item={true} xs={12}>
                    <Paper><DefaultTemplate/></Paper>
                </Grid>
                    <UserBasedTemplate
                        templateName={LoginVars.USER_TEMPLATE_NAME}
                        templateId={LoginVars.USER_TEMPLATE_ID}
                    />
            </Grid>
        );
    }
}  

export default withStyles(styles)(HomePage);