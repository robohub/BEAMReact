import * as React from 'react';
import { Chart } from 'chart.js';
import { Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';

class Example extends React.Component {

    componentDidMount() {

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
 /*               scales: {
                    yAxes: [{
                        ticks :  { 

                            beginAtZero: true,
                        }
                    }]
                }*/
            }
        });
        if (myChart.config.type !== 'line') {
            throw Error('Fel chart!');   // RH: To get rid of myChart declared but never used!!!
        }
    }

    render() {
        return (
            <div>
                <canvas id="myChart" width="400" height="400"/>
                <div>
                    <Row>
                        <Col sm="6">
                            <Card block={true}>
                                <CardTitle>Special Title Treatment</CardTitle>  
                                <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                                <Button>Go somewhere</Button>
                            </Card>
                        </Col>
                    </Row>
                    <Card block={true} className="text-center">
                        <CardTitle>Special Title Treatment</CardTitle>
                        <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                        <Button>Go somewhere</Button>
                    </Card>
                    <Card block={true} className="text-right">
                        <CardTitle>Special Title Treatment</CardTitle>
                        <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                        <Button>Go somewhere</Button>
                    </Card>
                </div>            
            </div>
        );
    }
}

export default Example;