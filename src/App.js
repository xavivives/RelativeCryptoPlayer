import React, { Component } from 'react';
import unga from './unga.js';    
import './App.css';
import { LineChart, Line ,CartesianGrid, XAxis, YAxis, Tooltip} from 'recharts';
import Axios from 'axios'
import CurrenciesList from './CurrenciesList.js'

const period = 
{
    fiveMinutes:300,
    fifteenMinutes:900,
    halfHour:1800,
    twoHours:7200,
    fourHours:14400,
    oneDay:86400
}

class App extends Component
{
    constructor (props)
    {
        super()

        this.state = {
            activeData:{},
            relativeData:{},
            currencies:[]
        }

        /*
        //Format example:

        activeData:{
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
        let days = 360
        let delta = days*24*60*60
        let startTimestamp = Date.now()/1000 - delta
        let endTimestamp = Date.now()/1000

        let currencyPair = this.getCurrencyPair(id)
        if(isReverted)
            currencyPair = this.getRevertedCurrencyPair(id)


        Axios.get('https://poloniex.com/public',{
                params:{
                command: 'returnChartData',
                currencyPair: currencyPair,
                period:period.fourHours,
                end:endTimestamp,
                start:startTimestamp
                }
        })
        .then((result)=> {
            console.log(result)
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
                let activeData = this.absorbCurrency(this.state.activeData, result.data, id, ['weightedAverage'], isReverted )
                let relativeData = this.calculateRelativePercentage(activeData, 0)
                this.setState({
                    activeData:activeData,
                    relativeData:relativeData
                })
            }
        });
    }

    calculateRelativePercentage(baseData, referenceIndex)
    {

        let relativeData = []

        for (var property in baseData)
        {
            if (baseData.hasOwnProperty(property))
            {
                relativeData[property]=[]

                let referenceRecord =  baseData[property][referenceIndex]

                baseData[property].map((x, index)=>
                {
                    let newRecord = {}

                    for (var currency in x)
                    {
                        if (x.hasOwnProperty(currency))
                        {
                            if(currency === 'date')
                                newRecord[currency] = x[currency]
                            else
                                newRecord[currency] = x[currency]/referenceRecord[currency]
                        }
                    }

                    relativeData[property].push(newRecord)
                })
            }
        }

        return relativeData
    }

    absorbCurrency(baseData, currencyArray, id, properties, isReverted)
    {
       let activeData = JSON.parse(JSON.stringify(baseData))

        properties.map((property, propertyIndex)=>
        {
            if(!activeData[property])
                activeData[property] = []

            let propertiesArray = activeData[property]

            currencyArray.map((currencyRecord, currencyRecordIndex)=>
            {
                let found = false
                for(let i= 0; i< propertiesArray.length; i++)
                {
                    if(currencyRecord.date === propertiesArray[i].date )
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
        })

        return activeData
    }

    canBeReverted(property)
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

        console.log("currency  toggled")

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

    getData=()=>
    {
        let data = []
        for (var currency in this.state.currencies) {
            if (this.state.currencies.hasOwnProperty(currency)) {
                if(this.state.currencies[currency].isActive) {
                    if(this.state.currencies[currency].history) {
                        for(let i = 0; i<this.state.currencies[currency].history.length; i++)
                        {
                            if(!data[i])
                                data[i] = {}

                            data[i][this.state.currencies[currency].id] = this.state.currencies[currency].history[i]
                        }
                    }
                }
            }
        }
    }

    onLineClick=(data)=>
    {
        if(!data)
            return
        let index = data.activeTooltipIndex
        let relativeData = this.calculateRelativePercentage(this.state.activeData, data.activeTooltipIndex)
        

        this.setState({
            relativeData:relativeData
        })
    }

    getCurrencyLines=()=>
    {
        let lines = []
        for (var currencyId in this.state.currencies) {
            if (this.state.currencies.hasOwnProperty(currencyId)) {
                if(this.state.currencies[currencyId].isActive) {
                    //if(this.state.activeData['weightedAverage'][currencyId]) {
                        console.log(currencyId)
                        lines.push(<Line  isAnimationActive ={true} type="monotone" key= {currencyId} dataKey={currencyId} stroke="#8833d8" dot = {false}/>)
                    //}
                }      
            }
        }
        return lines
    }


    render() {

        
        let lines = this.getCurrencyLines()

        return (
            <div className="App">
                

                <LineChart  onClick = {this.onLineClick} width={800} height={400} data={this.state.relativeData['weightedAverage']} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    
                    {lines}
                    
                    <XAxis  dataKey="name" />
                    <YAxis />
                    <Tooltip />
                </LineChart>

                <CurrenciesList  style={{width:200}} data= {this.state.currencies} onToggle={this.onCurrencyToggle}/>

            </div>
        );
    }
}

export default App;
