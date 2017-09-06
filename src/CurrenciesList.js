/* eslint-disable flowtype/require-valid-file-annotation */

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import List, { ListItem, ListItemSecondaryAction, ListItemText } from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import Avatar from 'material-ui/Avatar';

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    background: theme.palette.background.paper,
  },
});

class CheckboxListSecondary extends React.Component {
  state = {
    checked: [1],
  };

    handleToggle = (event, value) => {
        const { checked } = this.state;
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }

        this.setState({
          checked: newChecked,
        });
    };

    getList=()=>
    {
        let list = this.props.data.map((x,index)=> (

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

  render() {
    const classes = this.props.classes;

    let list = [<div/>]
    if(this.props.data)
        list = this.getList();

    return (
      <div className={classes.root}>
        <List>
            {list}
        </List>
      </div>
    );
  }
}

CheckboxListSecondary.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CheckboxListSecondary);