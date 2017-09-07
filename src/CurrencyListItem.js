import React from 'react'
import { withStyles } from 'material-ui/styles'
import List, { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List'
import Checkbox from 'material-ui/Checkbox'


class CurrencyListItem extends React.Component {


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
            <ListItem dense button key={this.props.data.id}>
                    <ListItemText key= 's'secondary={this.props.data.id} />
                    <ListItemText key = 'p' primary={this.props.data.name} />
                    <ListItemSecondaryAction>
                        <Checkbox
                            checked={this.props.data.isActive}
                            onChange={this.onToggle}
                        />
                    </ListItemSecondaryAction>
              </ListItem>
        )
    }
}

export default CurrencyListItem