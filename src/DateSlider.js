import React from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const style = { width: 400, margin: 50 }

const Range = Slider.Range

class DateSlider extends React.Component {
    constructor(props) {
        super(props)

        this.state =
        {
            min:0,
            max:100,
            startDate: 40,
            endDate:60,
            reference:50,
            referencePosition:1,
            beforeReferenceIndex:1,
            beforeValues:[],
            values:[40,50,60]
        };
    }


    getChangedIndex=(beforeValues, currenValues)=>
    {
        //assumes arrays are sorted
        let exists=[0,0,0]

        for(let i=0; i<beforeValues.length; i++)
        {
            for(let k=0; k<currenValues.length; k++)
            {
                if(beforeValues[i]==currenValues[k])
                {
                    exists[i]=1
                    continue
                }
            }
        }

        for(let i=0; i<exists.length; i++)
            if(!exists[i])
                return i

        return -1
    }

    onReferenceChanged=(value, position)=>
    {
        this.setState({
            'reference':value,
            'referencePosition':position
        })
    }

    onStartDateChanged=(value, position)=>
    {
        this.setState({'startDate':value})
    }

    onEndDateChanged=(value, position)=>
    {
        this.setState({'endDate':value})
    }



    onChange = (values) => {
 
        let changedIndex = this.getChangedIndex(this.state.beforeValues, values)

        if(changedIndex == this.state.beforeReferenceIndex)
            this.onReferenceChanged(values[changedIndex], changedIndex)
        else if(changedIndex<2)
            this.onStartDateChanged(values[changedIndex], changedIndex)
        else
            this.onEndDateChanged(values[changedIndex], changedIndex)

        this.setState({values:values})
    }

    onBeforeChange=(values)=>
    {  
        //console.log('before',values)
        
        this.setState({
            beforeValues:values
        })
    } 

    getValues=()=>
    {
        console.log(this.state.startDate,this.state.reference, this.state.endDate)
        //let values = [this.state.startDate,this.state.endDate]
        //values.splice(this.state.referencePosition, 0, this.state.reference)    
        //console.log('render',values)
        return [this.state.startDate, this.state.reference, this.state.endDate]
    }

    render() {
        let values = this.getValues()

        console.log(values)
        
        return (
            <div style={style}>
                <Range
                    value={this.state.values}
                    onChange={this.onChange}
                    onBeforeChange={this.onBeforeChange}
                    trackStyle={[{ backgroundColor: 'red' }, { backgroundColor: 'green' }]}
                    handleStyle={[{ backgroundColor: 'yellow' }, { backgroundColor: 'gray' }]}
                    railStyle={{ backgroundColor: 'grey' }}
                    />
            </div>
        )
    }
}
export default DateSlider