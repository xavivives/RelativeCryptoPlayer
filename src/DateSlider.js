import React from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const Range = Slider.Range

const unselectedColor='#dddddd'
const rangeColor = '#71d2ed'
const referenceColor = '#ff3366'

class DateSlider extends React.Component {
    constructor(props) {
        super(props)

        this.setStateFromProps(props)
    }

    componentWillReceiveProps=(nextProps)=> 
    {
        this.setStateFromProps(nextProps)
    }

    setStateFromProps=(props)=>
    {
        let referenceIndex = 1
        if(props.referenceDate>props.endDate)
            referenceIndex = 2
        else if (props.referenceDate<props.startDate)
            referenceIndex = 0

        let values = [props.startDate, props.endDate]
        values .splice(referenceIndex, 0, props.referenceDate)

        this.state =
        {
            startDate: props.startDate,
            endDate:props.endDate,
            reference:props.referenceDate,
            referenceIndex:referenceIndex,
            beforeReferenceIndex:referenceIndex,
            beforeValues:values,
            values:values
        }
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

        if(changedIndex === -1 || changingIndex === -1)
            return

        //reference is changing
        if(changedIndex === this.state.beforeReferenceIndex)
            reference = values[changingIndex]
        
        //start date is changing
        else if(changedIndex === 0  ||  (changedIndex === 1 && this.state.referenceIndex === 0) )
            startDate = values[changingIndex]
        
        //end date is changing
        else
            endDate = values[changingIndex]
        
        

        for(let i=0; i<values.length; i++)
        {
            if(values[i]===reference)
            {
                referenceIndex = i
                break
            }
        }

        if(endDate < startDate)
        {
            let date = endDate
            endDate = startDate
            startDate = date
        }

        if(startDate!= this.state.startDate)
            this.props.onStartDateChanged(startDate)
        

        if(reference!= this.state.reference)
            this.props.onReferenceDateChanged(reference)
        
        if(endDate!= this.state.endDate)
            this.props.onEndDateChanged(endDate)
        
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
        this.setState({
            beforeReferenceIndex:this.state.referenceIndex,
            beforeValues:values
        })
    } 

    getHandleStyles=()=>
    {
        let handles = [
            { backgroundColor: rangeColor, borderColor: rangeColor},
            { backgroundColor: rangeColor, borderColor: rangeColor},
            { backgroundColor: rangeColor, borderColor: rangeColor}]
        handles[this.state.referenceIndex] = { backgroundColor: referenceColor, borderColor: referenceColor}
        return handles
    }

    getTrackStyles=()=>
    {
        let rails = [
            { backgroundColor: rangeColor },
            { backgroundColor: rangeColor },
            { backgroundColor: rangeColor }
            ]

        if(this.state.referenceIndex == 0)
            rails[0] = { backgroundColor: unselectedColor }
        else if(this.state.referenceIndex == 2)
             rails[1] = { backgroundColor: unselectedColor }
        
        return rails
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
                    trackStyle={this.getTrackStyles()}
                    handleStyle={this.getHandleStyles()}
                    railStyle={{ backgroundColor: unselectedColor }}
                    />
            </div>
        )
    }
}
export default DateSlider