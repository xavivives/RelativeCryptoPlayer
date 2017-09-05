import React, { Component } from 'react';
import unga from './unga.js';    
import './App.css';
import { LineChart, Line ,CartesianGrid, XAxis, YAxis, Tooltip} from 'recharts';
import Axios from 'axios'

const data = [
      {name: 'Page A', uv: 4000, pv: 2400, amt: 2400},
      {name: 'Page B', uv: 3000, pv: 1398, amt: 2210},
      {name: 'Page C', uv: 2000, pv: 9800, amt: 2290},
      {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
      {name: 'Page E', uv: 1890, pv: 4800, amt: 2181},
      {name: 'Page F', uv: 2390, pv: 3800, amt: 2500},
      {name: 'Page G', uv: 3490, pv: 4300, amt: 2100},
];


class App extends Component {


    constructor (props)
    {
        super()
        let days = 360
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

        //let baseUrl= 'https://poloniex.com/public?command=returnChartData&currencyPair=BTC_XMR&end=9999999999&period=14400&start=1405699200'
        
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
                this.setState({data:result.data})
                console.log(result)
          });


        this.state = {data:[]}
    }

    render() {


        return (
            <div className="App">
                <unga/>
                    <LineChart width={900} height={500} data={this.state.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                       
                        <Line type="monotone" dataKey="high" stroke="#88ffd8" dot = {false}/>
                        <Line type="monotone" dataKey="low" stroke="#ff84d8" dot = {false} />
                        
                        
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                    </LineChart>
            </div>
        );
    }
}

export default App;
