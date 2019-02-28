import * as React from 'react';
import PlanningView from './pages/planningView';
import { Typography } from '@material-ui/core';

export default class LandingPage extends React.Component {
    render() {  
        return (
            <div>
                <Typography variant="h6">Welcome to the Planner landing page!</Typography>
                <PlanningView/>
            </div>
        );
    }
}  