import * as React from 'react';
import { withStyles, WithStyles, createStyles, Theme, MenuItem, TextField, NoSsr, Typography, Paper, Grid, Fab } from '@material-ui/core';

// import { styles } from '../../../shared/style';

import Select from 'react-select';
import { ValueType } from 'react-select/lib/types';
import { emphasize } from '@material-ui/core/styles/colorManipulator';
import { Styles } from 'react-select/lib/styles';
import { InputBaseProps } from '@material-ui/core/InputBase';

import { styles } from '../../../shared/style';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import { MappedBOsView } from './mappedBOsView';
import { Add } from '@material-ui/icons';

const getTemplateBOsQuery = gql`
query templateConfig {
    templateConfigs{
        id
        moObject {
            id
            name
            businessObjects { id name }
        }
    }
}
`;

export const rsStyles = ({ palette, spacing }: Theme) => createStyles({
  root: {
    // flexGrow: 1,
    // height: 250,
  },
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  chip: {
    margin: `${spacing.unit / 2}px ${spacing.unit / 4}px`,
  },
  chipFocused: {
    backgroundColor: emphasize(
      palette.type === 'light' ? palette.grey[300] : palette.grey[700],
      0.08,
    ),
  },
  noOptionsMessage: {
    padding: `${spacing.unit}px ${spacing.unit * 2}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: spacing.unit,
    left: 0,
    right: 0,
  },
  divider: {
    height: spacing.unit * 2,
  },
  robtextcolor: {
      color: palette.text.primary
  }
});

// tslint:disable-next-line:no-any
function NoOptionsMessage(props: any) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function inputComponent({ inputRef, defaultValue, onChange, onKeyDown, onKeyUp, ...props}: InputBaseProps) {
  return <div ref={inputRef} {...props}/>;
}

// tslint:disable-next-line:no-any
function Control(props: any) {
  return (
    <TextField
      fullWidth={true}
      InputProps={{
        inputComponent,
        inputRef: props.innerRef,
        inputProps: {
          className: props.selectProps.classes.input,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

// tslint:disable-next-line:no-any
function Option(props: any) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

// tslint:disable-next-line:no-any
function Placeholder(props: any) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

// tslint:disable-next-line:no-any
function SingleValue(props: any) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

// tslint:disable-next-line:no-any
function ValueContainer(props: any) {
  return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}
/*
// tslint:disable-next-line:no-any
function MultiValue(props: any) {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={props.classNames(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused,
      })}
      onDelete={props.removeProps.onClick}
      deleteIcon={<CancelIcon {...props.removeProps} />}
    />
  );
}
*/

// tslint:disable-next-line:no-any
function Menu(props: any) {
  return (
    <Paper square={true} className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

const components = {
  Control,
  Menu,
  ////////////// MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};

interface IntProps extends WithStyles<typeof rsStyles> {
    label: string;
    placeholder: string;
    options: {
        value: string;
        label: string;
    }[];
    onChange: (value: ValueType<{value: string, label: string}>) => void;
    value: ValueType<{value: string, label: string}>;
    isDisabled?: boolean;
}

class IntegrationReactSelect extends React.Component<IntProps> {

  handleChange = (value: ValueType<{value: string, label: string}>) => {
    this.props.onChange(value);
  }

  render() {
    const { classes } = this.props;

    const selectStyles: Styles = {
      input: base => ({
        ...base,
        color: classes.robtextcolor,
        '& input': {
          font: 'inherit',
        },
      }),
      valueContainer: base => ({
          ...base
      })
    };

    return (
      <div className={classes.root}>
        <NoSsr>
          <Select
            options={this.props.options}
            value={this.props.value}
            classes={classes}
            styles={selectStyles}
            onChange={this.handleChange}
            isDisabled={this.props.isDisabled ? this.props.isDisabled : false}
            components={components}

            placeholder={this.props.placeholder}
            isClearable={true}
            textFieldProps={{
                label: this.props.label,
                InputLabelProps: {
                    shrink: this.props.label === '' ? false : true,
                },
            }}
          />
          <div className={classes.divider} />
        </NoSsr>
      </div>
    );
  }
}

export const ReactSelect =  withStyles(rsStyles)(IntegrationReactSelect);

interface Props extends WithStyles<typeof styles> {}

class BoMappingTemplate extends React.Component<Props> {
    state = { selectValue: null as ValueType<{value: string, label: string}>};

    addMapping = () => {
        // Not implemented
    }

    onSelectChange = (value: ValueType<{value: string, label: string}>) => {
        this.setState({selectValue: value});
    }
        
    render() {
        const { classes } = this.props;

        return (
            <div >
                Mapping BO template
                <div>
                    <Query query={getTemplateBOsQuery}>
                    {({ loading, data: { templateConfigs }, error }) => {
                        if (loading) {
                            return <div>Loading</div>;
                        }
                        if (error) {
                            return <div>ERROR: {error.message}</div>;
                        }

                        if (!templateConfigs) { return '-No template config made...'; }

                        let options = new Array<{label: string, value: string}>();
                        templateConfigs[0].moObject.businessObjects.map((bo: {id: string, name: string}) =>
                            options.push({label: bo.name, value: bo.id})
                        );

                        return (
                            <Grid container={true}>
                                <Grid item={true} xs={12} md={5} xl={4} className={classes.paperMargin}>
                                    <Paper square={true} className={classes.root}>

                                        <ReactSelect
                                            label=""
                                            placeholder="<Select BO to be mapping>"
                                            options={options}
                                            onChange={this.onSelectChange}
                                            value={this.state.selectValue}
                                        />
                                        <ReactSelect
                                            label=""
                                            placeholder="<Select Template for mapping>"
                                            options={options}
                                            onChange={this.onSelectChange}
                                            value={this.state.selectValue}
                                            isDisabled={!this.state.selectValue}
                                        />
                                        <Fab size="small" color="primary" aria-label="Add" className={classes.button} onClick={this.addMapping} disabled={!this.state.selectValue}>
                                            <Add />
                                        </Fab>
                                    </Paper>
                                </Grid>
                                <Grid item={true} xs={12} md={7} xl={8}>
                                    <Paper square={true}>
                                        <MappedBOsView/>
                                    </Paper>
                                </Grid>
                            </Grid>
                        );
                    }}
                    </Query>
                </div>
            </div>
        );
    }
}

export const BoMappingTemplateView = withStyles(styles)(BoMappingTemplate);