
import * as React from 'react';
import Downshift from 'downshift';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { createStyles, Theme } from '@material-ui/core/styles';
import { IconButton, ListItem, ListItemText, List, Paper, Typography } from '@material-ui/core';
import { ExpandLess, ExpandMore, Clear } from '@material-ui/icons';

const styles = ({ spacing, palette }: Theme) => createStyles({
    frame: {
        flexGrow: 1,
        minHeight: spacing.unit * 8,
        margin: 0,
        height: '100%'
    },
    listContainer: {
        maxHeight: 300,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        width: 'auto',
        marginRight: spacing.unit,
        overflow: 'scroll'
    },
    active: {
        backgroundColor: palette.action.active
    },
    secondaryActionFrame: {
        overflow: 'visible',
        width: 2,
        height: 2,
        position: 'absolute',
        right: 0,
        bottoptom: 0,
        zIndex: 1
    },
    secondaryAction: {
        marginLeft: -48
    },
    inputFrame: { position: 'relative' },
    menuFrame: { position: 'relative' },
    menuAnchor: {
        zIndex: 2,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        overflow: 'visible',
        height: 0
    }
});

// tslint:disable-next-line:no-any
class MuiDownShiftCB extends React.Component<any> {
    
    // tslint:disable-next-line:no-any
    updateInputValue = (event: any) => {
        const { onChangeInput } = this.props;
        if (onChangeInput) {
            onChangeInput(event);
        }
    }

    render() {
        const {
            items,
            displayTemplate,
            label,
            placeholder,
            searchTemplate,
            // onChangeInput,
            inputDisplayTemplate,
            // onStateChange,
            // onChange,
            classes
        } = this.props;

        const boxThis = this;

        // tslint:disable-next-line:no-any
        function autoCompleteContents(options: any) {
            const {
                clearSelection,
                // getButtonProps,
                getInputProps,
                getItemProps,
                // getLabelProps,
                // getRootProps,
                highlightedIndex,
                inputValue,
                isOpen,
                // openMenu,
                selectHighlightedItem,
                // selectItem,
                // selectItemAtIndex,
                selectedItem,
                // setHighlightedIndex,
                toggleMenu,
                // getMenuProps
            } = options;

            function valuesBySearchTerm(item: { toString: () => void; }) {
                const _val = inputValue || '';

                if (!_val) {
                    return true;
                }

                const searchThis = searchTemplate
                    ? searchTemplate(item).toLowerCase()
                    : item.toString();

                return searchThis.includes(_val.toLowerCase());
            }

            // tslint:disable-next-line:no-any
            function autoCompleteItemToHtml(item: { label: string, value: string }, index: any) {
                let selected = false;

                if (selectedItem) {
                    if (item.value && selectedItem.value) {
                        selected = item.value === selectedItem.value;
                    }
                }

                const _props = getItemProps({
                    item,
                    index,
                    'data-highlighted': highlightedIndex === index,
                    'data-selected': selected,
                    onClick: () => {
                        selectHighlightedItem();
                    }
                });

                let stateColor = 'rgba(0,0,0,0)';

                if (_props['data-highlighted']) {
                    stateColor = 'rgba(0,0,0,0.12)';
                }

                if (_props['data-selected']) {
                    stateColor = 'rgba(0,0,0,0.46)';
                }

                return displayTemplate
                    ? displayTemplate(item, _props)
                    : (
                        <ListItem
                            button={true}
                            {..._props}
                            style={{
                                backgroundColor: stateColor,
                                textAlign: 'left',
                            }}
                            key={`autocomplete-item-${item.value}`}
                            dense={true}
                        >
                            <ListItemText
                                disableTypography={true}
                            >
                                <Typography variant="body1">
                                    {`${item.label}`}
                                </Typography>
                            </ListItemText>
                        </ListItem>
                
                    );
            }

            const autoCompleteMenuItems = isOpen
                ? items
                    .filter(valuesBySearchTerm.bind(boxThis))
                    .map(autoCompleteItemToHtml.bind(boxThis))
                : [];

            const autoCompleteMenu = (
                <div className={classes.menuAnchor}>
                    <Paper>
                    <List className={classes.listContainer}>
                        {autoCompleteMenuItems}
                    </List>
                    </Paper>
                </div>
            );
    
            let _value = inputValue || '';

            if (selectedItem && typeof selectedItem === 'object') {
                _value = inputDisplayTemplate(selectedItem);
            }

            const _inputProps = getInputProps({
                placeholder: placeholder || '',
                value: _value,

                label: label || '',
                onChange: boxThis.updateInputValue
            });

            let secondaryActionItem = isOpen ? <ExpandLess /> : <ExpandMore />;

            let secondaryActionEvent = toggleMenu;
            if (selectedItem) {
                secondaryActionItem = <Clear />;
                secondaryActionEvent = () => {
                    clearSelection();
                };
            }

            const secondaryAction = (
                <IconButton
                    className={classes.secondaryAction}
                    onClick={secondaryActionEvent}
                >
                    {secondaryActionItem}
                </IconButton>
            );

            return (
                <div className={classes.frame}>
                    <div className={classes.inputFrame}>
                        <div className={classes.secondaryActionFrame}>
                            {secondaryAction}
                        </div>
                        <TextField {..._inputProps} fullWidth={true} />
                    </div>
                    <div className={classes.menuFrame}>
                        {isOpen ? autoCompleteMenu : null}
                    </div>
                </div>
            );
        }

        return (
            <Downshift
                {...this.props}
                itemToString={item => (item ? item.label : '')}
            >
                {autoCompleteContents.bind(this)}
            </Downshift>
        );
    }
}

const MuiDownShiftCBStyled = withStyles(styles)(MuiDownShiftCB);

interface Props {
    label: string;
    placeholder?: string;
    options: {label: string, value: string}[];
    onChange: (val: string) => void;
    value?: string;
}

export class MuiDownShiftComboBox extends React.Component<Props> {
    render() {
        return (
            <MuiDownShiftCBStyled
                // This is the list of data that is databound to the combobox
                items={this.props.options}

                // This is a template that can be overridden for each list item
                // displayTemplate={this.displayTemplate}

                // This is the label that appears atop the input
                label={this.props.label}

                // This is placeholder text when the input has focus
                placeholder={this.props.placeholder ? this.props.placeholder : ''}

                initialInputValue={this.props.value ? this.props.value : ''}

                // This affects the search behavior
                // Maybe what you search is different from just
                // one single prop.
                // so this is how one might search across many properties
                searchTemplate={(item: { label: string; }) => `${item.label}`}

                // Currently a noop, but you can fire an event
                // as a side effect each time the input changes
                // onChangeInput={event => {}}

                // This controls what you see in the actual input
                // when an item is selected
                inputDisplayTemplate={(selectedItem: { label: string; }) => `${selectedItem.label}`}

                // This event fires every time there are state changes inside the Combobox
                onStateChange={() => {
                    // Uncomment this, if you'd like to track the state changes in the console.

                    // console.log('highlightedIndex',highlightedIndex);
                    // console.log('inputValue',inputValue);
                    // console.log('isOpen',isOpen);
                    // console.log('selectedItem',selectedItem);

                }}

                // This (very important) event fires everytime a new item in the combobox
                // Is selected
                onChange={(selectedItem: { value: string, label: string }) => {
                    this.props.onChange(selectedItem ? selectedItem.value : '');
                }}
            />
        );
    }
}