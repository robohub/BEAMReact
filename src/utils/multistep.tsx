import * as React from 'react';
import { Card, Col } from 'reactstrap';
import { Button } from 'semantic-ui-react';

export type StepsComponent = {
  name: string;
  component: JSX.Element;
};
interface MultiProps  {
  steps: StepsComponent[];
  showNavigation?: boolean;
}
type NavState = {
  current: number;
  styles: string[];
};
interface State {
  showPreviousBtn: boolean;
  showNextBtn: boolean;
  compState: number;
  navState: NavState;
}

export default class MultiStep extends React.Component<MultiProps, State> {
  public static defaultProps: Partial<MultiProps> = {
    showNavigation: true
  };
  hidden: { display: string; };
  constructor(props: MultiProps) {
    super(props);
    this.state = {
      showPreviousBtn: false,
      showNextBtn: true,
      compState: 0,
      navState: this.getNavStates(0, this.props.steps.length)
    };
    this.hidden = {
      display: 'none'
    };
    this.handleOnClick = this.handleOnClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
  }

  getNavStates(indx: number, length: number) {
    let styles = [];
    for (let i = 0; i < length; i++) {
      if (i < indx) {
        styles.push('done');
      } else if (i === indx) {
        styles.push('doing');
      } else {
        styles.push('todo');
      }
    }
    return { current: indx, styles: styles };
  }

  checkNavState(currentStep: number) {
    if (currentStep > 0 && currentStep < this.props.steps.length - 1) {
      this.setState({
        showPreviousBtn: true,
        showNextBtn: true
      });
    } else if (currentStep === 0) {
      this.setState({
        showPreviousBtn: false,
        showNextBtn: true
      });
    } else {
      this.setState({
        showPreviousBtn: true,
        showNextBtn: false
      });
    }
  }

  setNavState(next: number) {
    this.setState({navState: this.getNavStates(next, this.props.steps.length)});
    if (next < this.props.steps.length) {
      this.setState({compState: next});
    }
    this.checkNavState(next);
  }

  handleKeyDown = (evt: KeyboardEvent) =>  {
    if (evt.which === 13) {
      this.next();
    }
  }

  handleOnClick = (evt: React.MouseEvent<HTMLInputElement>) => {
    if (Number(evt.currentTarget.value) === (this.props.steps.length - 1) &&
      this.state.compState === (this.props.steps.length - 1)) {
      this.setNavState(this.props.steps.length);
    } else {
      this.setNavState(Number(evt.currentTarget.value));
    }
  }

  next = () => {
    this.setNavState(this.state.compState + 1);
  }

  previous = () => {
    if (this.state.compState > 0) {
      this.setNavState(this.state.compState - 1);
    }
  }
/*
  getClassName(className, i) {
    return className + '-' + this.state.navState.styles[i];
  }
*/
  renderSteps() {
    return this.props.steps.map((s, i) => (
      <Col /*className={this.getClassName('progtrckr', i)} onClick={this.handleOnClick} key={i} value={i}*/>
        <em>{i + 1}</em>
        <span>{this.props.steps[i].name}</span>
      </Col>
    ));
  }

  render() {

    return (
      <Card block={true} /*onKeyDown={this.handleKeyDown}*/>
        <div>
          {this.renderSteps()}
        </div>
        {this.props.steps[this.state.compState].component}
        <div style={this.props.showNavigation ? {} : this.hidden}>
          <Button style={this.state.showPreviousBtn ? {} : this.hidden} onClick={this.previous}>
            Previous
          </Button>
          <Button style={this.state.showNextBtn ? {} : this.hidden} onClick={this.next}>
            Next
          </Button>
        </div>
      </Card>
    );
  }
}