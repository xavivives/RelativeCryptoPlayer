import React, { Component } from 'react'
import unga from './unga.js'
import './App.css'
import { LineChart, Line ,CartesianGrid, XAxis, YAxis, Tooltip} from 'recharts'
import Axios from 'axios'
import CurrenciesList from './CurrenciesList.js'
import Chroma from 'chroma-js'
import DateSlider from './DateSlider.js'
import DatePicker from 'material-ui/DatePicker'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

const interval = 
{
    fiveMinutes:300,
    fifteenMinutes:900,
    halfHour:1800,
    twoHours:7200,
    fourHours:14400,
    oneDay:86400
}

const properties =
{
    weightedAverage:'weightedAverage'
}
const days = 4*360
const delta = days*24*60*60
const startTimestamp = Date.now()/1000 - delta
const endTimestamp = Date.now()/1000
const currentInterval = interval.oneDay

class App extends Component
{
    constructor (props)
    {
        super()

        this.state = {
            baseData:{},
            relativeData:{},
            currencies:[],
            startDate:startTimestamp,
            endDate:endTimestamp,
            referenceDate: Math.floor((startTimestamp + endTimestamp)/2),
            graphWidth: window.innerWidth,
            graphHeight:window.innerHeight/2
        }

        /*
        //Format example:

        baseData:{
            'weightedAverage':[{'BTC_XMR':1,'BTC_ETH':2,'date':123}],
            'volume':[{'BTC_XMR':1,'BTC_ETH':2,'date':123}],
            'relativeAvarage':[{'BTC_XMR':1,'BTC_ETH':2,'date':123}],
        }
        */

        this.getCurrencyPairs()
        //let baseUrl= 'https://poloniex.com/public?command=returnChartData&currencyPair=BTC_XMR&end=9999999999&period=14400&start=1405699200'
    }

    downloadCurrency=(id, isReverted = false)=>
    {
        let currencyPair = this.getCurrencyPair(id)
        if(isReverted)
            currencyPair = this.getRevertedCurrencyPair(id)


        Axios.get('https://poloniex.com/public',{
                params:{
                command: 'returnChartData',
                currencyPair: currencyPair,
                period:currentInterval,
                end:endTimestamp,
                start:startTimestamp
                }
        })
        .then((result)=> {
            if(result.data.error)
            {   
                if (result.data.error === "Invalid currency pair." && isReverted === false)
                {
                    console.warn('Trying reverted pair for '+ id)
                    this.downloadCurrency(id, true)
                    return
                }
                else
                {
                    console.error(result.data.error)
                    return
                }
            }
                
            if(result.data)
            {
                let baseData = this.absorbCurrency(this.state.baseData, result.data, id, [properties.weightedAverage], isReverted )
                this.setState({
                    baseData:baseData,
                })
            }
        });
    }

    calculateData=(property, startDate, endDate, referenceDate)=>
    {
        let data = this.getData(property)
        if(data.length === 0)
            return
        let referenceRecord = this.getReferenceRecordByDate(data, referenceDate)
        data = this.getTrimmedData(data, startDate, endDate)
        data = this.getRelativeData(data, referenceRecord)
        return  data
    }

    getData=(property)=>
    {
        if(this.state.baseData[property])
            return this.state.baseData[property]

       return[]
    }

    getReferenceRecordByDate=(data,referenceDate)=>
    {
        let referenceIndex = this.getIndexByDate(data, referenceDate)
        if(referenceIndex === -1)
            console.error('No index for reference date: '+referenceDate)
        
        let referenceRecord =  data[referenceIndex]
        if(!referenceRecord)
            console.error('No record for reference index: '+referenceIndex)

        return referenceRecord
    }

    getRelativeData=(data, referenceRecord)=>
    {
        let relativeData = []

        data.map((record, index)=>
        {
            let newRecord = {}

            for (var currency in record)
            {
                if (record.hasOwnProperty(currency))
                {
                    if(currency === 'date')
                        newRecord[currency] = record[currency]
                    else
                        newRecord[currency] = record[currency]/referenceRecord[currency]
                }
            }

            relativeData.push(newRecord)
        })

        return relativeData
    }

    getIndexByDate=(data, date)=>
    {
        let previousDate = -1

        for (let i = 0; i<data.length; i++)
        {
            if(data[i].date === date)
                return i

            if(date> previousDate && date < data[i].date)
                return i

            if(date<data[i].date && previousDate == -1)
                return 0

            if(i >= data.length-1)
                return data.length-1

            previousDate = data[i].date
        }
        return -1
    }

    getDateByIndex = (data, index)=>
    {
        return data[index].date
    }

    getTrimmedData=(data, startDate, endDate)=>
    { 
        let startIndex = this.getIndexByDate(data,startDate)
        let endIndex = this.getIndexByDate(data, endDate)
        return data.slice(startIndex, endIndex)
    }

    absorbCurrency=(baseData, currencyArray, id, properties, isReverted)=>
    {
        properties.map((property, propertyIndex)=>
        {
            if(!baseData[property])
                baseData[property] = []

            let propertiesArray = baseData[property]

            currencyArray.map((currencyRecord, currencyRecordIndex)=>
            {
                let found = false
                for(let i= 0; i< propertiesArray.length; i++)
                {
                    if(currencyRecord.date === propertiesArray[i].date)
                    {
                        propertiesArray[i][id] = currencyRecord[property]
                        
                        if(isReverted)
                            if(this.canBeReverted(property))
                                propertiesArray[i][id] = 1/propertiesArray[i][id]

                        found = true
                        break
                    }
                }
            
                if(!found)
                {
                    let newRecord = {}
                    newRecord.date = currencyRecord.date
                    newRecord[id] = currencyRecord[property]

                    if(isReverted)
                        if(this.canBeReverted(property))
                            newRecord[id] = 1/newRecord[id]

                    propertiesArray.push(newRecord)
                }
            })

            propertiesArray=propertiesArray.sort(this.sortByDate)
               
        })

        return baseData
    }

    sortByDate=(a,b)=>
    {
        if(a.date>b.date)
            return 1
        else
            return -1
    }

    canBeReverted=(property)=>
    {
        if(property ==='weightedAverage')
            return true
        else
            return false
    }

    enableCurrency=(id)=>
    {
        if(!this.state.currencies[id].data)
            this.downloadCurrency(id)
    }

    onCurrencyToggle=(data, isOn)=>
    {
        let currencies = this.state.currencies
        currencies[data.id].isActive = isOn
        this.setState({currencies:currencies})

        if(isOn)
            this.enableCurrency(data.id)
    }

    getCurrencyPair=(id)=>
    {
        return 'BTC_'+id
    }

    getRevertedCurrencyPair=(id)=>
    {
        return id+'_BTC'
    }

    getCurrencyPairs=()=>
    {
        //"https://poloniex.com/public?command=returnCurrencies"
        Axios.get('https://poloniex.com/public',{params:{command: 'returnCurrencies'}})
        .then((result)=> {
            let currencies = []

            for (var currency in result.data) {
                if (result.data.hasOwnProperty(currency)) {
                    if(result.data[currency].disabled || result.data[currency].delisted)
                        continue;

                    let c = {
                        id:currency,
                        name:result.data[currency].name,
                        isActive:false
                    }

                    currencies[currency]=c    
                }
            }

            this.setState({currencies:currencies})
        }).catch((error)=>{console.error(error)});
    }

    onLineClick=(data)=>
    {
        if(!data)
            return
        let index = data.activeTooltipIndex

        this.setState({
            referenceDate:this.getDateByIndex(this.getData(properties.weightedAverage), index)
        })
    }

    getNumberOfActiveCurrencies=()=>
    {
        let activeCurrencies = 0
         for (var currencyId in this.state.currencies)
            if (this.state.currencies.hasOwnProperty(currencyId))
                if(this.state.currencies[currencyId].isActive)
                    activeCurrencies ++

        return activeCurrencies
    }

    getCurrencyLines=()=>
    {
        let numberOfCurrencies = this.getNumberOfActiveCurrencies()
        let colors = Chroma.scale(['#ccc7f3','#ff3366']).mode('hsl').colors(numberOfCurrencies)
        let lines = []
        let colorIndex = 0
        for (var currencyId in this.state.currencies) {
            
            if (this.state.currencies.hasOwnProperty(currencyId)) {
                
                if(this.state.currencies[currencyId].isActive) {
                    lines.push(<Line  isAnimationActive ={false} type="monotone" key= {currencyId} dataKey={currencyId} stroke={colors[colorIndex++]} dot = {false}/>)

                }      
            }
        }
        return lines
    }

    onPickerStartDateChanged=(x, date)=>
    {
        let value = date.getTime()/1000
        this.setState({startDate:value})
        console.log(value)
    }

    onStartDateChanged=(value)=>
    {
        this.setState({startDate:value})
    }

    onEndDateChanged=(value)=>
    {
        this.setState({endDate:value})
    }

    onReferenceDateChanged=(value)=>
    {
        console.log(value)
        this.setState({referenceDate:value})
    }

    secondsToDate=(seconds)=>
    {
        if(!seconds)
            return new Date()
        return new Date(Math.floor(seconds)*1000)
    }

    dateToSeconds=(date)=>
    {
        return date.toTime()/1000
    }

    render()
    {
        let data = this.calculateData('weightedAverage', this.state.startDate, this.state.endDate, this.state.referenceDate)
        let lines = this.getCurrencyLines()

        return (
            <MuiThemeProvider>
            <div className="App" style={{backgroundColor:'white'}}>
                
                <LineChart  onClick = {this.onLineClick}
                    width={this.state.graphWidth}
                    height={this.state.graphHeight}
                    data={data}
                    margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                    
                    {lines}
                    
                    <XAxis  dataKey="name" />
                    <YAxis />
                    <Tooltip wrapperStyleObject = {{backgroundColor:'red'}}/>
                </LineChart>

                 <div>
                    <DatePicker
                        hintText="Start date"
                        value = {this.secondsToDate(this.state.startDate)}
                        minDate = {this.secondsToDate(startTimestamp)}
                        maxDate = {this.secondsToDate(endTimestamp)}
                        onChange={this.onPickerStartDateChanged}/>
                    <DatePicker hintText="End date" value = {this.secondsToDate(this.state.endDate)}/>
                    <DatePicker hintText="Reference" value= {this.secondsToDate(this.state.reference)}/>
                </div>

                <DateSlider
                    min = {startTimestamp}
                    max = {endTimestamp}
                    interval = {currentInterval}
                    onStartDateChanged={this.onStartDateChanged}
                    onEndDateChanged={this.onEndDateChanged}
                    onReferenceDateChanged={this.onReferenceDateChanged}
                    startDate={this.state.startDate}
                    endDate={this.state.endDate}
                    referenceDate={this.state.referenceDate}/>

                <CurrenciesList 
                    style={{width:200}}
                    data= {this.state.currencies}
                    onToggle={this.onCurrencyToggle}/>
            </div>
            </MuiThemeProvider>
        )
    }
}

export default App;
