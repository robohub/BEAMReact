import * as React from 'react';
import { Chart } from 'chart.js';
// import * as moment from 'moment';
import * as vis from 'vis';
import { Typography } from '@material-ui/core';

class Example extends React.Component {

    componentDidMount() {
/*
        var container = document.getElementById('visualization') as HTMLCanvasElement;
        var data = [
          {id: 1, content: 'item 1', start: '2013-04-20'},
          {id: 2, content: 'item 2', start: '2013-04-14'},
          {id: 3, content: 'item 3', start: '2013-04-18'},
          {id: 4, content: 'item 4', start: '2013-04-16', end: '2013-04-19'},
          {id: 5, content: 'item 5', start: '2013-04-25'},
          {id: 6, content: 'item 6', start: '2013-04-27'}
        ];
        var options = {};
        var timeline = new vis.Timeline(container, data, options);
        timeline.redraw();
*/
        var canvas = document.getElementById('myChart') as HTMLCanvasElement;
        var ctx  = canvas.getContext('2d') as CanvasRenderingContext2D;

        var myChart = new Chart(ctx, {
            type : 'line',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
            }
        });
        if (myChart.config.type !== 'line') {
            throw Error('Fel chart!');   // RH: To get rid of myChart declared but never used!!!
        }

        // var now = moment().minutes(0).seconds(0).milliseconds(0);
        // var itemCount = 60;
      
        // create a data set with groups
        var groups = new vis.DataSet();
      
        groups.add([
          {
            id: 3,
            content: 'Target Architecture',
            nestedGroups: [4, 5],
          },
          {
            id: 2,
            content: 'Devops preparation',
            stacking: false
          },
          {
            id: 1,
            content: 'Information Governance',
            nestedGroups: [6, 7],
          },
      
        ]);
      
        groups.add([
          {
            id: 4,
            content: 'TA development',
          },
          {
            id: 5,
            content: 'API mgmt rollout',
          },
          {
            id: 6,
            content: 'Information Mgmt strategy',
          },
          {
            id: 7,
            content: 'EA repository',
          }
        ]);
      
        // create a dataset with items
        var items = new vis.DataSet();

        items.add([{id: 10, content: 'Setup', start: '2018-03-01', end: '2018-06-30', group: 2}]);
        items.add([{id: 11, content: 'PoC', start: '2018-09-01', end: '2018-11-30', group: 2}]);
        items.add([{id: 12, content: 'Team pilot', start: '2019-01-01', end: '2019-06-30', group: 2}]);
        items.add([{id: 13, content: 'Rollout', start: '2019-08-01', end: '2019-12-31', group: 2}]);

        items.add([{id: 20, content: 'Define EA', start: '2018-08-01', end: '2018-11-30', group: 7}]);
        items.add([{id: 21, content: 'PoC', start: '2019-02-01', end: '2019-03-31', group: 7}]);
        items.add([{id: 22, content: 'Pilot', start: '2019-05-01', end: '2019-11-30', group: 7}]);
        items.add([{id: 23, content: 'Deploy', start: '2020-01-01', end: '2020-06-30', group: 7}]);

        items.add([{id: 30, content: 'Elaboration & Definition', start: '2018-01-01', end: '2018-06-31', group: 6}]);
        items.add([{id: 31, content: 'Deployment', start: '2018-09-01', end: '2019-03-31', group: 6}]);

        items.add([{id: 40, content: 'Pilot', start: '2018-04-01', end: '2018-12-31', group: 5}]);
        items.add([{id: 41, content: 'Rollout', start: '2019-02-01', end: '2019-06-30', group: 5}]);

        items.add([{id: 50, content: 'Inception', start: '2018-01-01', end: '2018-06-30', group: 4}]);
        items.add([{id: 51, content: 'PoC', start: '2018-09-01', end: '2019-06-30', group: 4}]);
        items.add([{id: 52, content: 'Deployment', start: '2019-09-01', end: '2020-06-30', group: 4}]);

        /*
        var groupIds = groups.getIds();
        var types = [ 'box', 'point', 'range', 'background'];
        for (var i = 0; i < itemCount; i++) {
          var start = now.clone().add(Math.random() * 200, 'hours');
          var end = start.clone().add(2, 'hours');
          var randomGroupId = groupIds[Math.floor(Math.random() * groupIds.length)];
          var type = types[Math.floor(4 * Math.random())];
      
          items.add({
            id: i,
            group: randomGroupId,
            content: 'item ' + i,
            start: start,
            end: end,
            type: type
          });
        }
      */
        // create visualization
        var container2 = document.getElementById('visualization2');
        var options2 = {
          groupOrder: 'content',  // groupOrder can be a property name or a sorting function
          margin: {
            item: 40,
          }
        };
      
        var timeline2 = new vis.Timeline(container2, items, groups, options2);
        timeline2.redraw();
    }

    render() {
        return (
            <div>
                <div id="visualization"/>  
                <Typography variant="h3">Target Architecture Roadmap</Typography>      
                <div id="visualization2"/>         
                <canvas id="myChart" width="300" height="300" />
            </div>
        );
    }
}

export default Example;