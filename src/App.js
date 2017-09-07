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

    downloadCurrency=(id, revertedPair = false)=>
    {
        let days = 30
        let delta = days*24*60*60
        let startTimestamp = Date.now()/1000 - delta
        let endTimestamp = Date.now()/1000

        let currencyPair = this.getCurrencyPair(id)
        if(revertedPair)
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
                if (result.data.error === "Invalid currency pair." && revertedPair === false)
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
                this.absorbCurrency(this.state.activeData, result.data, id, ['weightedAverage'] )
        });
    }

    absorbCurrency(baseData, currencyArray, id, properties)
    {
       let activeData = JSON.parse(JSON.stringify(baseData));

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
                        found = true
                        break
                    }
                }
            
                if(!found)
                {
                    let newRecord = {}
                    newRecord.date = currencyRecord.date
                    newRecord[id] = currencyRecord[property]
                    propertiesArray.push(newRecord)
                }

            })
        })

        this.setState({activeData:activeData})
        console.log("activeData uploaded", this.state.activeData)
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

    getCurrencyLines=()=>
    {
        let lines = []
        for (var currencyId in this.state.currencies) {
            if (this.state.currencies.hasOwnProperty(currencyId)) {
                if(this.state.currencies[currencyId].isActive) {
                    //if(this.state.activeData['weightedAverage'][currencyId]) {
                        console.log(currencyId)
                        lines.push(<Line isAnimationActive ={false} type="monotone" key= {currencyId} dataKey={currencyId} stroke="#8833d8" dot = {false}/>)
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
                

                <LineChart  width={800} height={400} data={this.state.activeData['weightedAverage']} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    
                    {lines}
                    
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                </LineChart>

                <CurrenciesList  style={{width:200}} data= {this.state.currencies} onToggle={this.onCurrencyToggle}/>

            </div>
        );
    }
}

export default App;
