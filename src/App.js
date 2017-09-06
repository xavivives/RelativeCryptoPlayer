import React, { Component } from 'react';
import unga from './unga.js';    
import './App.css';
import { LineChart, Line ,CartesianGrid, XAxis, YAxis, Tooltip} from 'recharts';
import Axios from 'axios'

class App extends Component
{
    constructor (props)
    {
        super()
        let days = 30
        let delta = days*24*60*60
        let startTimestamp = Date.now()/1000 - delta
        let endTimestamp = Date.now()/1000
        let period = 
        {
            fiveMinutes:300,
            fifteenMinutes:900,
            halfHour:1800,
            twoHours:7200,
            fourHours:14400,
            oneDay:86400
        }

        this.state = {data:[]}
        //let baseUrl= 'https://poloniex.com/public?command=returnChartData&currencyPair=BTC_XMR&end=9999999999&period=14400&start=1405699200'
        

        this.getCurrencyPairs();
        let main = []
        Axios.get('https://poloniex.com/public',{
                params:{
                command: 'returnChartData',
                currencyPair: 'BTC_XMR',
                period:period.oneDay,
                end:endTimestamp,
                start:startTimestamp
                }
            })
        .then((result)=> {

            let referenceValue = result.data[0].weightedAverage

            result.data.map(function(x, index)
            {
                if(!main[index])
                    main[index] = {}

                main[index]['BTC_XMR'] = x.weightedAverage/referenceValue
                
            })

            this.setState({data:main})
            console.log(main)
        });


        Axios.get('https://poloniex.com/public',{
                params:{
                command: 'returnChartData',
                currencyPair: 'BTC_ETH',
                period:period.oneDay,
                end:endTimestamp,
                start:startTimestamp
            }
        })
        .then((result)=> {

            let referenceValue = result.data[0].weightedAverage

            result.data.map(function(x, index)
            {
                if(!main[index])
                    main[index] = {}

                main[index]['BTC_ETH'] = x.weightedAverage/referenceValue
                
            })

            this.setState({Data:main})

        });


        Axios.get('https://poloniex.com/public',{
                params:{
                command: 'returnChartData',
                currencyPair: 'USDT_BTC',
                period:period.oneDay,
                end:endTimestamp,
                start:startTimestamp
                }
        })
        .then((result)=> {

            let referenceValue = result.data[0].weightedAverage

            result.data.map(function(x, index)
            {
                if(!main[index])
                    main[index] = {}

                main[index]['BTC_USDT'] = 1/(x.weightedAverage/referenceValue)
                
            })

            this.setState({Data:main})

        });

        Axios.get('https://poloniex.com/public',{
                params:{
                command: 'returnChartData',
                currencyPair: 'BTC_LTC',
                period:period.oneDay,
                end:endTimestamp,
                start:startTimestamp
                }
        })
        .then((result)=> {

            let referenceValue = result.data[0].weightedAverage

            result.data.map(function(x, index)
            {
                if(!main[index])
                    main[index] = {}

                main[index]['BTC_LTC'] = 1/(x.weightedAverage/referenceValue)
                
            })

            this.setState({Data:main})

        });

    


        
    }


    getCurrencyPairs=()=>
    {
        //"https://poloniex.com/public?command=returnCurrencies"
        Axios.get('https://poloniex.com/public',{params:{command: 'returnCurrencies'}})
        .then((result)=> {
            console.log(result)

            let currencies = []

            for (var currency in result.data) {
                if (result.data.hasOwnProperty(currency)) {
                    if(result.data[currency].disabled || result.data[currency].delisted)
                        continue;


                    let c = {
                        id:currency,
                        name:result.data[currency].name
                    }

                    currencies.push(c)
                  
                }
            }

            console.log(currencies)
            
        });

    }


    render() {


        return (
            <div className="App">
                <unga/>
                    <LineChart width={900} height={500} data={this.state.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                       
                        <Line type="monotone" dataKey="BTC_ETH" stroke="#88ffd8" dot = {false}/>
                        <Line type="monotone" dataKey="BTC_XMR" stroke="#ff84d8" dot = {false} />
                        <Line type="monotone" dataKey="BTC_USDT" stroke="#888488" dot = {false} />
                        <Line type="monotone" dataKey="BTC_LTC" stroke="#833488" dot = {false} />
                        
                        
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                    </LineChart>


            </div>
        );
    }
}

export default App;
