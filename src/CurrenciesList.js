/* eslint-disable flowtype/require-valid-file-annotation */

import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import List, { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List'
import Checkbox from 'material-ui/Checkbox'
import Input from 'material-ui/Input/Input'

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    background: theme.palette.background.paper,
  },
})

class CheckboxListSecondary extends React.Component {


    constructor(props)
    {
        super()
        console.log(props)
        this.state = {
            filteredList:props.data
        }
    }

    handleToggle = (event, value) => {
        const { checked } = this.state
        const currentIndex = checked.indexOf(value)
        const newChecked = [...checked]

        if (currentIndex === -1) {
          newChecked.push(value)
        } else {
          newChecked.splice(currentIndex, 1)
        }

        this.setState({
          checked: newChecked,
        })
    }

    getList=()=>
    {
        let list = this.state.filteredList.map((x,index)=> (

            <ListItem dense button key={x.id}>
                <ListItemText secondary={x.id} />
                <ListItemText primary={x.name} />
                <ListItemSecondaryAction>
                  <Checkbox
                    onClick={this.handleToggle}
                    checked={0}
                  />
                </ListItemSecondaryAction>
            </ListItem>
        ))

        return list
    }

    onSearchChange=(e)=>
    {
        if(e.target.value=="")
        {
            this.setState({filteredList:this.props.data})
            return
        }

        let filteredList = this.getSearch(e.target.value)

        this.setState({filteredList:filteredList})
    }

    getSearch=(str)=>
    {
        var searchResults = []
        
        for (var i=0; i < this.props.data.length; i++)
        {
            if ((this.props.data[i].name.indexOf(str)!==-1) || (this.props.data[i].id.indexOf(str)!==-1))
            {
                searchResults.push(this.props.data[i])
            }
        }
        
        return searchResults
    }

  render() {
    const classes = this.props.classes

    let list = [<div/>]
    if(this.props.data)
        list = this.getList()

    return (
      <div className={classes.root}>
        <Input
            placeholder="Search"
            className={classes.input}
            inputProps={{'aria-label': 'Description',}}
            onChange={this.onSearchChange}/>
        <List>
            {list}
        </List>
      </div>
    )
  }
}

CheckboxListSecondary.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(CheckboxListSecondary)