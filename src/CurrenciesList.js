/* eslint-disable flowtype/require-valid-file-annotation */

import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import List, { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List'
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField';
import CurrencyListItem from './CurrencyListItem.js'

class CurrenciesList extends React.Component
{


    constructor(props)
    {
        super()
        console.log(props)
        this.state = {
            filteredList:props.data
        }
    }

    onToggle = (data, value) =>
    {
        this.props.onToggle(data,value)
    }

    getList=()=>
    {
        let list = this.state.filteredList.map((x,index)=>(<CurrencyListItem onToggle = {this.onToggle} data={x}/>))

        return list
    }

    onSearchChange=(e)=>
    {
        let filteredList = this.getSearch(e.target.value)

        this.setState({filteredList:filteredList})
    }

    getSearch=(str)=>
    {
        var searchResults = []
        
        for (var currency in this.props.data) {
            if ( this.props.data.hasOwnProperty(currency)) {

                if ((this.props.data[currency].name.toLowerCase().indexOf(str.toLowerCase())!==-1) || (this.props.data[currency].id.toLowerCase().indexOf(str.toLowerCase())!==-1))
                {
                    searchResults.push(this.props.data[currency])
                }
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
      <div >
        <TextField
            placeholder="Search"
            onChange={this.onSearchChange}/>
        <List>
            {list}
        </List>
      </div>
    )
  }
}

export default CurrenciesList