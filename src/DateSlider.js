import React from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const Range = Slider.Range

class DateSlider extends React.Component {
    constructor(props) {
        super(props)

        this.state =
        {
            min:0,
            max:100,
            startDate: props.startDate,
            endDate:props.endDate,
            reference:props.referenceDate,
            referenceIndex:1,
            beforeReferenceIndex:1,
            beforeValues:[],
            values:[props.startDate, props.referenceDate, props.endDate]
        };
    }

    componentWillReceiveProps=(nextProps)=> 
    {
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
            

        for(let i=0; i<beforeValues.length; i++)
            if(beforeValues[i] != currenValues[i])
                return i

        return -1
    }


    onChange = (values) => {
 
        let changedIndex = this.getChangedIndex(this.state.beforeValues, values)
        let changingIndex = this.getChangedIndex(this.state.values, values)

        let startDate = this.state.startDate
        let endDate = this.state.endDate
        let reference = this.state.reference
        let referenceIndex = this.state.referenceIndex

        console.log(changingIndex, changedIndex)

        if(changedIndex == -1)
            return

        //reference is changing
        if(changedIndex == this.state.beforeReferenceIndex)
        {
            reference = values[changingIndex]
        }
        
        //start date is changing
        else if(changedIndex == 0  ||  (changedIndex == 1 && this.state.referenceIndex ==0) )
        {
            if(changingIndex !== -1)
            {
                startDate = values[changingIndex]
            }
        }
        
        //end date is changing
        else if(changingIndex !== -1)
        {
                endDate = values[changingIndex]
        }
        

        for(let i=0; i<values.length; i++)
        {
            if(values[i]==reference)
            {
                referenceIndex = i
                break
            }
        }

        if(startDate!= this.state.startDate)
            this.props.onStartDateChanged(startDate)
        

        if(reference!= this.state.reference)
            this.props.onReferenceDateChanged(reference)
        
        if(endDate!= this.state.endDate)
            this.props.onEndDateChanged(endDate)
        

        //console.log(referenceIndex)
        this.setState({
            values:values,
            startDate: startDate,
            endDate:endDate,
            reference:reference,
            referenceIndex:referenceIndex

        })
    }

    onBeforeChange=(values)=>
    {  
        //console.log('before',values)
        
        this.setState({
            beforeReferenceIndex:this.state.referenceIndex,
            beforeValues:values
        })
    } 

    getHandleStyles=()=>
    {
        let baseColor = 'blue'
        let referenceColor = 'yellow'
        let handles = [{ backgroundColor: baseColor }, { backgroundColor: baseColor }, { backgroundColor: baseColor }]
        handles[this.state.referenceIndex].backgroundColor = referenceColor
        return handles
    }

    render() {
        return (
            <div style={{margin: 50 }}>
                <Range
                    min = {this.props.min}
                    max = {this.props.max}
                    step = {this.props.interval}
                    value={this.state.values}
                    onChange={this.onChange}
                    onBeforeChange={this.onBeforeChange}
                    trackStyle={[{ backgroundColor: 'red' }, { backgroundColor: 'green' }]}
                    handleStyle={this.getHandleStyles()}
                    railStyle={{ backgroundColor: 'grey' }}
                    />
            </div>
        )
    }
}
export default DateSlider