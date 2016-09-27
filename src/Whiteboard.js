import React from 'react';
import d3 from 'd3';
import {MODE} from './Constant';
import WhiteboardBase from './WhiteboardBase';
import Canvas from './Canvas';


export default class Whiteboard extends WhiteboardBase {

    constructor(props) {
        super(props);
        this.state = {
            dataset: [],
            undoStack: [],
            mode: MODE.HAND,
            strokeWidth: 5,
            strokeColor: 'black',
        };
    }

    componentDidMount() {
        d3.select('body').on('keydown.body', () => {
            this.emitter.emit('keydown.body', d3.event.keyCode);
        });

        let that = this;
        this.emitter.on('keydown.body', (keyCode) => {
            if (keyCode === 48) { // 0'
                that.toggleMode();
            }
            if (keyCode >= 49 && keyCode <= 57) { // '1' - '9'
                that.changeStrokeWidth(keyCode - 48);
            }
            if (keyCode === 67) { // 'c'
                that.toggleStrokeColor();
            }
        });
        this.emitter.on('mousemove.canvas', (point) => {
            that.pushPoint(point);
        });
        this.emitter.on('click.canvas', (point) => {
            that.toggleMode(point);
        });
        this.emitter.on('undo.pallete', () => {
            that.undoPoint();
        });
        this.emitter.on('redo.pallete', () => {
            that.redoPoint();
        });
    }

    toggleMode(point) {
        if (this.state.mode === MODE.LINE) {
            this.setState({
                mode: MODE.HAND,
            });
        } else {
            const dataset = this.state.dataset;
            dataset.push({
                strokeWidth: this.state.strokeWidth,
                strokeColor: this.state.strokeColor,
                values: point ? [point] : [],
            });
            this.setState({
                mode: MODE.LINE,
                dataset: dataset,
            });
        }
    }

    changeStrokeWidth(width) {
        this.setState({
            strokeWidth: width,
        });
    }

    toggleStrokeColor() {
        if (this.state.strokeColor === 'black') {
            this.setState({
                strokeColor: 'red',
            });
        } else if (this.state.strokeColor === 'red') {
            this.setState({
                strokeColor: 'green',
            });
        } else if (this.state.strokeColor === 'green') {
            this.setState({
                strokeColor: 'blue',
            });
        } else {
            this.setState({
                strokeColor: 'black',
            });
        }
    }

    pushPoint(point) {
        if (this.state.mode === MODE.HAND) {
            return;
        }

        const dataset = this.state.dataset;
        const current = dataset[dataset.length - 1];

        if (current &&
                current.strokeWidth === this.state.strokeWidth &&
                current.strokeColor === this.state.strokeColor) {
            current.values.push(point);
            this.setState({
                dataset: dataset,
                undoStack: [],
            });
        } else {
            dataset.push({
                strokeWidth: this.state.strokeWidth,
                strokeColor: this.state.strokeColor,
                values: [point],
            });
            this.setState({
                dataset: dataset,
                undoStack: [],
            });
        }
    }

    undoPoint() {
        const dataset = this.state.dataset;
        const current = dataset[dataset.length - 1];
        const undoStack = this.state.undoStack;

        if (current && current.values.length > 1) {
            const point = current.values.pop();
            const undoOperation = (newState) => {
                const dataset = this.state.dataset;
                const current = dataset[dataset.length - 1];
                current.values.push(point);
                newState.dataset = dataset;
                this.setState(newState);
            };
            undoStack.push(undoOperation);
            this.setState({
                dataset: dataset,
                undoStack: undoStack,
            });

        } else if (current && current.values.length === 1) {
            dataset.pop();
            const undoOperation = (newState) => {
                const dataset = this.state.dataset;
                dataset.push(current);
                newState.dataset = dataset;
                this.setState(newState);
            };
            undoStack.push(undoOperation);
            this.setState({
                dataset: dataset,
                undoStack: undoStack,
            });
        }
    }

    redoPoint() {
        const undoStack = this.state.undoStack;
        const redoOperation = undoStack.pop();
        if (redoOperation) {
            redoOperation({
                undoStack: undoStack,
            });
        }
    }

    clearPoint() {
        this.setState({
            dataset: [],
            undoStack: [],
        });
    }

    render() {
        return (
            <div>
                <Canvas {...this.props} {...this.state} />
            </div>
        );
    }

}
