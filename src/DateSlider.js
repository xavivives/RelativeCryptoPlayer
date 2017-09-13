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
            referenceIndex:1,
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
            

        for(let i=0; i<beforeValues.length; i++)
            if(beforeValues[i] != currenValues[i])
                return i

        return -1
    }


    onChange = (values) => {
 
        let changedIndex = this.getChangedIndex(this.state.beforeValues, values)
        let changingIndex = this.getChangedIndex(this.state.values, values)

        console.log(changedIndex, changingIndex)

        let startDate = this.state.startDate
        let endDate = this.state.endDate
        let reference = this.state.reference

        if(changedIndex == -1)
            return

        //reference is changing
        if(changedIndex == this.state.beforeReferenceIndex)
            reference = values[changingIndex]
        
        //start date is changing
        else if(changedIndex == 0  ||  (changedIndex == 1 && this.state.referenceIndex ==0) )
            startDate = values[changingIndex]
        
        //end date is changing
        else
            endDate = values[changingIndex]
        

        let referenceIndex = this.state.referenceIndex

        for(let i=0; i<values.length; i++)
        {
            if(values[i]==reference)
            {
                referenceIndex = i
                break
            }
        }


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
            <div style={style}>
                <Range
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