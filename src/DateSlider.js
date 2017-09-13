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

        console.log("AAA")
        return -1
    }

    onReferenceChanged=(value, currentIndex)=>
    {
        this.setState({
            'reference':value,
            'referenceIndex':currentIndex
        })
    }

    onStartDateChanged=(value, currentIndex)=>
    {
        let referenceIndex = this.state.referenceIndex
        if(currentIndex ==  this.state.referenceIndex)



        this.setState({
            'startDate':value,
            'referenceIndex':currentIndex
        })
    }

    onEndDateChanged=(value, currentIndex)=>
    {
        this.setState({'endDate':value})
    }



    onChange = (values) => {
 
        let changedIndex = this.getChangedIndex(this.state.beforeValues, values)
        let changingIndex = this.getChangedIndex(this.state.values, values)


        let startDate = this.state.startDate
        let endDate = this.state.endDate
        let reference = this.state.reference
        let referenceIndex = this.state.referenceIndex



        console.log("in",changedIndex, changingIndex)
        
        if(changedIndex == -1)
            return

        for(let i=0; i<values.length; i++)
        {
            if(changedIndex==values[i])
                changingIndex = i
        }

        //reference is changing
        if(changedIndex == this.state.beforeReferenceIndex)
        {
            console.log("ref")
            reference = values[changedIndex]
            referenceIndex = changingIndex
        }

        //start date is changing
        else if(changedIndex<2)
        {
            console.log("start")
            startDate = values[changedIndex]

            if(this.state.referenceIndex == changingIndex)
            {
                if(changingIndex == 0)
                    referenceIndex = 1
                else  if(changingIndex == 1)
                    referenceIndex = 0
            }

        }
        //end date is changing
        else
        {
            console.log("end")
            endDate = values[changedIndex]
            if(this.state.referenceIndex == changingIndex)
            {
                if(changingIndex == 1)
                    referenceIndex = 2
                
                else if(changingIndex == 2)
                    referenceIndex = 1

            }
        }



        this.setState({
            values:values,
            startDate: startDate,
            endDate:endDate,
            reference:reference,
            referenceIndex: referenceIndex
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

    getValues=()=>
    {
        //console.log(this.state.startDate,this.state.reference, this.state.endDate)
        //let values = [this.state.startDate,this.state.endDate]
        //values.splice(this.state.referenceIndex, 0, this.state.reference)    
        //console.log('render',values)
        return [this.state.startDate, this.state.reference, this.state.endDate]
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
        let values = this.getValues()

       //console.log(values)
        
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