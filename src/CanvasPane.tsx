import * as React from "react";

import {
  AnyReducedEvent,
  EventStore,
  ImageData,
  isReducedImageEvent,
  isReducedLineEvent,
  PointData,
} from "./EventStore";

type Props = {
  eventStore: EventStore;
  width: number;
  height: number;
  style: {
    backgroundColor: string;
  };
};

type State = {};

export class CanvasPane extends React.Component<Props, State> {
  props: Props;
  state: State;

  svgElement?: SVGSVGElement;

  constructor(props: Props) {
    super(props);

    this.svgElement = null;
  }

  getSvgElement(): SVGSVGElement | undefined {
    return this.svgElement;
  }

  render() {
    const canvasLayerStyle = {
      position: "absolute" as "absolute",
      width: this.props.width,
      height: this.props.height,
    };

    return (
      <div style={canvasLayerStyle}>
        <svg
          ref={(element) => (this.svgElement = element)}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width={this.props.width}
          height={this.props.height}
        >
          <rect
            width={"100%"}
            height={"100%"}
            fill={this.props.style.backgroundColor}
          />
          {this.drawWhiteboardCanvas()}
          {this.drawImageBorder()}
        </svg>
      </div>
    );
  }

  drawWhiteboardCanvas(): Array<React.ComponentElement<any, any> | undefined> {
    return this.props.eventStore
      .reduceEvents()
      .map((element: AnyReducedEvent, index: number):
        | React.ComponentElement<any, any>
        | undefined => {
        if (isReducedLineEvent(element)) {
          const key = index;
          const d = element.values.map((point: PointData, index: number) => {
            if (index === 0) {
              return "M " + point.x + " " + point.y;
            } else {
              return "L " + point.x + " " + point.y;
            }
          });

          return (
            <path
              key={key}
              d={d.join(" ")}
              fill="none"
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
            />
          );
        } else if (isReducedImageEvent(element)) {
          const key = index;
          const image: ImageData = element.image;

          return (
            <image
              key={key}
              x={image.x}
              y={image.y}
              width={image.width}
              height={image.height}
              xlinkHref={image.dataUrl}
            />
          );
        } else {
          return null;
        }
      });
  }

  drawImageBorder(): React.ComponentElement<any, any> | undefined {
    const lastImage = this.props.eventStore.lastImage();
    if (!lastImage) {
      return null;
    }

    return (
      <rect
        x={lastImage.x}
        y={lastImage.y}
        width={lastImage.width}
        height={lastImage.height}
        fill={"none"}
        stroke={"black"}
        strokeDasharray={"5,5"}
      />
    );
  }
}
