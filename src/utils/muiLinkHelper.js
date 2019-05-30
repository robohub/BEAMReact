import * as React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ListItem, ListItemText, ListItemIcon } from '@material-ui/core'

export class ListItemLink extends React.Component {
    renderLink = React.forwardRef((itemProps, ref) => (
        // with react-router-dom@^5.0.0 use `ref` instead of `innerRef`
        <RouterLink to={this.props.to} {...itemProps} ref={ref} />
    ));

    render() {
        const { icon, primary, secondary, to } = this.props;
        return (
            <li>
                <ListItem button component={this.renderLink}>
                    {icon && <ListItemIcon>{icon}</ListItemIcon>}
                    <ListItemText primary={primary} secondary={secondary} />
                </ListItem>
            </li>
        );
    }
}