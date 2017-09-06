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
            data:[],
            currencies:[]}

        this.getCurrencyPairs()
        //let baseUrl= 'https://poloniex.com/public?command=returnChartData&currencyPair=BTC_XMR&end=9999999999&period=14400&start=1405699200'
    }

    downloadCurrency=(id)=>
    {
        let days = 30
        let delta = days*24*60*60
        let startTimestamp = Date.now()/1000 - delta
        let endTimestamp = Date.now()/1000

        Axios.get('https://poloniex.com/public',{
                params:{
                command: 'returnChartData',
                currencyPair: this.getCurrencyPair(id),
                period:period.oneDay,
                end:endTimestamp,
                start:startTimestamp
                }
        })
        .then((result)=> {
            console.log(result)
            
            let history = result.data.map(function(x, index)
            {
                let data = {}
                data.weightedAverage = x.weightedAverage
                return data
            })

            let currencies = this.state.currencies
            currencies[id].history = history
            this.setState({currencies:currencies})
            console.log(currencies)
        });
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
        for (var currency in this.state.currencies) {
            if (this.state.currencies.hasOwnProperty(currency)) {
                if(this.state.currencies[currency].isActive) {
                    if(this.state.currencies[currency].history) {
                        lines.push(<Line type="monotone" dataKey={this.state.currencies[currency].id} stroke="#88ffd8" dot = {false}/>)
                    }
                }      
            }
        }
    }


    render() {

        let data = this.getData()
        let lines = this.getCurrencyLines()


        return (
            <div className="App">
                

                <LineChart  width={500} height={500} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    
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
