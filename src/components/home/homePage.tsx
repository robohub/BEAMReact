import * as React from 'react';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { Grid, WithStyles, withStyles, Paper } from '@material-ui/core';

import { LoginVars } from '../shared/globals';

import { styles } from '../shared/style';
import { GridSize } from '@material-ui/core/Grid';

import TimeLine from '../planner/pages/components/timeLine';
import BOGraphContainer from '../navigation/navComponents/boGraphContainer';

class DefaultTemplate extends React.Component {
    render() {  
        return (
            <div>
                DefaultTemplate
            </div>
        );
    }
}

const getTemplate = gql`
query getTemplate($tid:ID){
  template(
    where: {id: $tid}
  ) {
    id
    name
    renderColumns {
      id
	  width
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
    renderColumns: {
        width: GridSize;
        widgets: WidgetType[];
    }[]
};

interface WidgetProps extends WithStyles<typeof styles> {
    render: WidgetType;
}

class WidgetBase extends React.Component<WidgetProps> {

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

        const { classes } = this.props;

        const { render } = this.props;
        switch (render.type) {
            case 'Plan':
                return (
                    // TIMELINE WIDGET
                    <div className={classes.root}>
                        <TimeLine
                            selectedBO={render.boid}
                            updateSelectedBO={this.updateSelectedBO}
                            selectedBoName={render.name}
                            readonly={true}
                        />
                    </div>
                );
            case 'Navigation':
                return (
                    // 'NAVIGATION WIDGET'
                    <BOGraphContainer
                        selectedBO={render.boid}
                        updateInfoView={this.updateSelectedBO}
                    />
                );
            case 'Text':
                return render.text;

            default:
                return <span> -Widget Type not implemented-</span>;
            }       
    }
}

const Widget = withStyles(styles)(WidgetBase);

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
            <Grid container={true} spacing={16}>

                <Grid item={true} xs={12}>
                    <div>
                        Logged in user: {' ' + LoginVars.USER_ID}
                    </div>
                    <div>
                        User Template: {' ' + this.props.templateName}
                    </div>
                </Grid>
                {LoginVars.USER_ID !== '' ?
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

                            const template = data3.template as TemplateType;

                            if (template) {
                                return (
                                    template.renderColumns.length ?
                                        template.renderColumns.map((col, i) =>
                                            <Grid item={true} xs={col.width} key={i} style={{backgroundColor: (i + 1) % 2 ? 'grey' : 'yellow'}}>
                                                {col.widgets.length > 0 ? 
                                                    col.widgets.map((widget, j) => 
                                                        <Grid item={true} xs={widget.width} key={j}>
                                                            <Paper style={{ marginBottom: '10px'}}>
                                                                <Widget render={widget}/>
                                                            </Paper>
                                                        </Grid>
                                                    
                                                    )
                                                    :
                                                    <div>-No widgets defined for this column-</div>
                                                }
                                            </Grid>
                                        )
                                        :
                                        <div>-No widgets defined for this template-</div>
                                );
                            } else {
                                // RH TODO: decide if this is necessary
                                return <div>-User template mapping setup not finished...-</div>;
                            }
                        }}
                    </Query>
                    :
                    null
                }
            </Grid>
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
/*        if (LoginVars.USER_ID === '') {
            return '-NOT LOGGED IN-';
}*/
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