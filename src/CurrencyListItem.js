import React from 'react'
import { withStyles } from 'material-ui/styles'
import List, { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List'
import Checkbox from 'material-ui/Checkbox'
import Toggle from 'material-ui/Toggle';


class CurrencyListItem extends React.Component
{
    constructor(props)
    {
        super()
    }

    onToggle = (event, value) =>
    {
       this.props.onToggle(this.props.data, value)
    }

    render() {
        return (
            <ListItem
                key={this.props.data.id}
                primaryText={this.props.data.name}
                rightToggle={
                    <Toggle
                        toogled={this.props.data.isActive}
                        onToggle={this.onToggle}
                    />}
                secondaryText={this.props.data.id}/>        )
    }
}

export default CurrencyListItem